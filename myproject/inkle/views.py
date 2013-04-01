# HTTP response modules
from django.template import RequestContext
from django.http import HttpResponse, Http404
from django.shortcuts import render_to_response
from django.template.loader import render_to_string

# User authentication
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_exempt

# JSON module
from django.utils import simplejson

# URL module
import urllib2

# Inkle database models and emails
from myproject.inkle.models import *
from myproject.inkle.emails import *

# Regular expression database querying module
from django.db.models import Q

# Date/time module
import datetime

# Regular expression module
import re

import string
import random

# TODO: get rid of shutil? No
import shutil

# TODO: clean up print statements


def raise_404_view(request):
    """Raises a 404 error."""
    raise Http404()


def is_logged_in(request):
    """Returns True if a member is logged in or False otherwise."""
    return HttpResponse(request.user.is_authenticated())


@ensure_csrf_cookie
def get_csrf_token_view(request):
    """Returns the CSRF token for the current session."""
    return HttpResponse(request.META["CSRF_COOKIE"])


@csrf_exempt
def email_login_view(request):
    """Logs in a non-Facebook member or returns a login error."""
    # Get the inputted email and password
    try:
        email = request.POST["email"]
        password = request.POST["password"]
    except KeyError as error:
        return HttpResponse("Error accessing request POST data: " + error)

    # Create a string to hold the login error
    response_error = ""

    # Validate the email and password
    if ((not email) and (not password)):
        response_error = "Email and password not specified"
    elif (not email):
        response_error = "Email not specified"
    elif (not password):
        response_error = "Password not specified"

    # Log in the member if their email and password are correct
    if (not response_error):
        try:
            user = Member.objects.get(email = email)
            user = authenticate(username = user.username, password = password)
            if (user and user.is_active):
                login(request, user)
            else:
                response_error = "Invalid login combination"
        except Exception as error:
            response_error = "Invalid login combination"

    # Create and return a JSON object
    response = simplejson.dumps({
        "success": response_error == "",
        "error": response_error
    })

    return HttpResponse(response, mimetype = "application/json")


def facebook_login_view(request):
    """Logs in a Facebook member or returns a login error."""
    # Get the Facebook information sent via POST
    try:
        facebook_id = request.POST["facebookId"]
        facebook_access_token = request.POST["facebookAccessToken"]
        first_name = request.POST["firstName"]
        last_name = request.POST["lastName"]
        email = request.POST["email"]
        day = int(request.POST["birthday"].split('/')[1])
        month = int(request.POST["birthday"].split('/')[0])
        year = int(request.POST["birthday"].split('/')[2])
        birthday = datetime.date(day = day, month = month, year = year)
        gender = request.POST["gender"][0]
    except KeyError as e:
        return HttpResponse("Error accessing request POST data: " + e.message)

    # Create a string to hold the login error
    response_error = ""

    # Get the user with the inputted Facebook ID
    try:
        user = Member.objects.get(facebook_id = facebook_id)
        if (not user.is_active):
            user = None
    except:
        user = None

    # If there already is a Facebook user, skip this
    if (not user):
        try:
            # If there is a non-Facebook user with the inputted username, return an error
            user = Member.objects.filter(is_active = True).get(email = email)
            response_error = "A user with that email address already exists. Link your account to Facebook in the settings tab."
        except:
            # If there is no Facebook or non-Facebook user already created, create it
            user = Member(
                first_name = first_name,
                last_name = last_name,
                username = email,
                email = email,
                facebook_id = facebook_id,
                birthday = birthday,
                gender = gender
            )

            # Set the user's password as unusable since they are a Facebook user and don't have a password
            user.set_unusable_password()
            user.save()

            # Make a default image for the user
            if (gender == "Male"):
                shutil.copyfile("inkle/static/media/images/main/man.jpg", "inkle/static/media/images/members/" + str(user.id) + ".jpg")
            else:
                shutil.copyfile("inkle/static/media/images/main/woman.jpg", "inkle/static/media/images/members/" + str(user.id) + ".jpg")

    # If there is a user object and no errors, authenticate the user
    if (user and not response_error):
        user = authenticate(facebook_id = facebook_id, facebook_access_token = facebook_access_token)
        if (user and user.is_active):
            login(request, user)
        else:
            response_error = "Invalid login"

    # Create and return a JSON object
    response = simplejson.dumps({
        "success": response_error == "",
        "error": response_error
    })

    return HttpResponse(response, mimetype = "application/json")


def logout_view(request):
    """Logs out the logged-in member."""
    logout(request)
    return HttpResponse()


def forgotten_password_view(request):
    """Sends a PIN to the inputted email address so they can reset their password."""
    # Get the POST data
    try:
        email = request.POST["email"]
        pin = request.POST["pin"]
    except:
        raise Http404()

    # Create a string to hold the responses
    response_error = ""
    pin_validated = False

    # Validate the email
    if (not email):
        response_error = "Email not specified"
    elif (not is_email(email)):
        response_error = "Invalid email format"

    if (not response_error):
        # Get the user with the inputted email
        try:
            user = Member.objects.get(email = email)
        except:
            user = None

        if (user):
            # If a PIN is provided, validate it
            if (pin):
                if ((not user.is_facebook_member()) and (pin == str(user.password_reset_pin)) and (len(pin) == 6)):
                    pin_validated = True
                else:
                    response_error = "Invalid PIN"

            # Otherwise, if the user is not a Facebook member, send them an email with their new PIN
            else:
                if (not user.is_facebook_member()):
                    user.password_reset_pin = random.randint(100000, 999999)
                    user.save()
                    send_password_reset_email(user)

    # Create and return a JSON object
    response = simplejson.dumps({
        "success": response_error == "",
        "pin_validated": pin_validated,
        "email": email,
        "pin": pin,
        "error": response_error
    })

    return HttpResponse(response, mimetype = "application/json")


def is_email(email):
    """Returns True if the inputted email is a valid email address format; otherwise, returns False."""
    if (re.search(r"[a-zA-Z0-9+_\-\.]+@[0-9a-zA-Z][\.-0-9a-zA-Z]*\.[a-zA-Z]+", email)):
        return True
    else:
        return False


def is_thirteen(month, day, year):
    """Returns True if the inputted date represents a birthday of someone who is at least thirteen years old; otherwise, returns False."""
    return True # TODO: FIX THIS!!
    born = datetime.date(day = int(day), month = int(month), year = int(year))
    today = datetime.date.today()   # TODO: localize today's date

    try:
        birthday = born.replace(year = today.year)
    except ValueError:
        birthday = born.replace(year = today.year, day = born.day - 1)

    if birthday > today:
        age = today.year - born.year - 1
    else:
        age = today.year - born.year

    return (age < 13)


def registration_view(request):
    """Registers a new member."""
    # Get the POST data
    try:
        first_name = request.POST["firstName"]
        last_name = request.POST["lastName"]
        gender = request.POST["gender"]
        birthday = request.POST["birthday"]
        email = request.POST["email"]
        password = request.POST["password"]
        confirm_password = request.POST["confirmPassword"]
    except KeyError:
        raise Http404()

    # Parse the birthday (format: YYYY-MM-DDT00:00:00)
    if birthday:
        birthday = birthday.split("T")[0].split("-")
        year = int(birthday[0])
        month = int(birthday[1])
        day = int(birthday[2])

    # Set the username equal to the email
    username = email

    # Create a string to hold the registration error
    response_error = ""

    # Validate the first name
    if (not first_name):
        response_error = "First name not specified"

    # Validate the last name
    elif (not last_name):
        response_error = "Last name not specified"

    # Validate the gender
    elif (gender not in ["Male", "Female"]):
        response_error = "Gender not specified"

    # Validate the birthday
    elif (not birthday):
        response_error = "Birthday not specified"
    elif (not is_thirteen(month, day, year)):
        response_error = "You must be at least thirteen years old to use Inkle"

    # Validate the email
    elif (not email):
        response_error = "Email not specified"
    elif (not is_email(email)):
        response_error = "Invalid email format"
    elif (Member.objects.filter(email = email)):
        response_error = "Email not valid."

    # Make sure the username is less than 30 characters and do a trick to ensure it is unique
    elif (len(username) > 30):
        username = username[0:30]
        first = True
        while (Member.objects.filter(username = username)):
            if (first):
                username = username[0:27] + "000"
                first = False
            else:
                new_number = int(username[27]) * 100 + int(username[28]) * 10 + int(username[29]) + 1
                if (new_number < 10):
                    username = username[0:27] + "00" + str(new_number)
                elif (new_number < 100):
                    username = username[0:27] + "0" + str(new_number)
                else:
                    username = username[0:27] + str(new_number)

    # Validate the password and confirm password
    elif (not password):
        response_error = "Password not specified"
    elif (len(password) < 8):
        response_error = "Password must contain at least eight characters"
    elif (not confirm_password):
        response_error = "Confirm password not specified"
    elif (password != confirm_password):
        response_error = "Password and confirm password do not match"

    # If the registration form is valid, create a new member with the provided POST data
    if (not response_error):
        # Create a new user
        user = Member(
            first_name = first_name,
            last_name = last_name,
            username = username,
            email = email,
            birthday = datetime.date(day = day, month = month, year = year),
            gender = gender
        )
        user.set_password(password)
        user.save()

        # Make a default image for the user
        if (gender == "Male"):
            shutil.copyfile("inkle/static/media/images/main/man.jpg", "inkle/static/media/images/members/" + str(user.id) + ".jpg")
        else:
            shutil.copyfile("inkle/static/media/images/main/woman.jpg", "inkle/static/media/images/members/" + str(user.id) + ".jpg")

        # Log the user in
        user = authenticate(username = username, password = password)
        login(request, user)
        user.last_login = datetime.datetime.now()  # TODO: get rid of this since built in django login alreayd does this? Does it?
        user.save()

    # Create and return a JSON object
    response = simplejson.dumps({
        "success": response_error == "",
        "error": response_error
    })

    return HttpResponse(response, mimetype = "application/json")


def get_members_from_groups(member, group_ids):
    members = []

    for group_id in group_ids:
        # If the group ID is -1, add all the members who are in none of the logged-in member's groups
        if (group_id == "-1"):
            not_grouped_members = list(member.friends.all())
            for g in member.group_set.all():
                for m in g.members.all():
                    if (m in not_grouped_members):
                        not_grouped_members.remove(m)

            members.extend(not_grouped_members)

        # Otherwise, add each member from the group corresponding to the current group ID
        else:
            group = Group.objects.get(pk = group_id)
            if (group.creator == member):
                for m in group.members.all():
                    if (m not in members):
                        members.append(m)

    return members


def get_inkling_list_item_html(inkling, member):
    """Returns the HTML for an inkling list item."""
    # Get the member thumbnails for those attending the inputted inkling
    num_members_attending = inkling.get_num_members_attending() # TODO: make this into a template tag
    num_members_attending_thumbnails = min(num_members_attending, 5)   # TODO: make 5 a global variable
    members_attending = list(inkling.get_members_attending())[0 : num_members_attending_thumbnails]
    inkling.is_member_attending = inkling in member.inklings.all()

    # Get the HTML for the inkling list item
    html = render_to_string("inklingListItem.html", {
        "i": inkling,
        "members_attending": members_attending,
        "num_other_members_attending": num_members_attending - num_members_attending_thumbnails
    })

    return html


def get_group_list_item_main_content_html(group, group_members = None):
    """Returns the HTML for a group list item (in the main content)."""
    # Get the group members if this is not the "Not Grouped" group
    if (group_members == None):
        group_members = list(group.members.all())

    # Get the member thumbnails for those a part of the inputted group
    num_group_members = len(group_members)
    num_group_member_thumbnails = min(num_group_members, 10)   # TODO: make 7 a global variable
    group_members = group_members[0:num_group_member_thumbnails]

    # Get the HTML for the group list item
    html = render_to_string("groupListItemMainContent.html", {
        "g": group,
        "group_members": group_members,
        "num_other_group_members": num_group_members - num_group_member_thumbnails
    })

    return html


def get_group_list_item_panel_html(group, group_members = None):
    """Returns the HTML for a group list item (in a panel)."""
    # Get the group members if this is not the "Not Grouped" group
    if (group_members == None):
        group_members = list(group.members.all())

    # Get the HTML for the group list item
    html = render_to_string("groupListItemPanel.html", {
        "g": group
    })

    return html


@login_required
def link_facebook_account_view(request):
    """Links an existing user account to a facebook account."""
    # Create a string to hold the login error
    response_error = ""

    # Get the POST data
    try:
        facebook_id = request.POST["facebookId"]
        facebookAccessToken = request.POST["facebookAccessToken"]
        email = request.POST["email"]
    except KeyError as e:
        return HttpResponse("Error accessing request POST data: " + e.message)

    # Check if the user has separate email and Facebook accounts already and tell them that they cannot currently be merged
    try:
        user = Member.objects.get(facebook_id = facebook_id)
        if (user.is_active):
            response_error = "An inkle account already exists for that Facebook user."
    except:
        user = None

    if (not response_error):
        # Alert the user if their emails do not match
        if (email != request.user.email):
            response_error = "The email addresses for your Facebook and inkle accounts do not match. Update your email in the settings before linking to Facebook."

        # Otherwise, convert their email account to a Facebook one
        else:
            request.user.facebook_id = facebook_id
            request.user.set_unusable_password()
            request.user.save()
            request.user.save()

            # Log the user out and require them to log in with Facebook
            logout(request)

    # Create and return a JSON object
    response = simplejson.dumps({
        "success": response_error == "",
        "error": response_error
    })

    return HttpResponse(response, mimetype = "application/json")


@login_required
def all_inklings_view(request):
    """Returns a list of the inklings which the logged-in member's friends are attending."""
    # Determine if we should return dated or no-dated inklings
    try:
        onlyIncludeUndatedInklings = request.POST["onlyIncludeUndatedInklings"]
    except:
        onlyIncludeUndatedInklings = "false"

    # If necessary, get the UTC date, or set it to today if no date is specified
    if (onlyIncludeUndatedInklings == "false"):
        try:
            day = int(request.POST["day"])
            month = int(request.POST["month"])
            year = int(request.POST["year"])
            date = datetime.date(year, month, day)
        except KeyError:
            raise Http404()
    else:
        date = None

    # Get a list of the members who are in the groups selected by the logged-in member; otherwise, get all of the logged-in member's friends
    if ("selectedGroupIds" in request.POST):
        selected_group_ids = request.POST["selectedGroupIds"]
        if (selected_group_ids):
            selected_group_ids = selected_group_ids.split(",")[:-1]
        members = get_members_from_groups(request.user, selected_group_ids)
    else:
        members = list(request.user.friends.filter(is_active = True))

    # Append the logged-in member to the members list
    members.append(request.user)

    # Get the inklings the members are attending on the specified date
    inklings = []
    for m in members:
        for i in m.inklings.filter(date = date):
            if i not in inklings:
                if (m == request.user):
                    inklings.append(i)
                else:
                    try:
                        sp = SharingPermission.objects.get(creator = m, inkling = i)
                    except:
                        raise Http404()
                    if (request.user in list(sp.members.all())):  # TODO: change to a "_contains" query if we can?
                        inklings.append(i)

    # Get the HTML for every inkling
    response_inklings = []
    for i in inklings:
        response_inklings.append({
            "html": get_inkling_list_item_html(i, request.user),
            "inklingId": i.id,
            "attendingGroupIds": i.get_groups_attending_inkling(request.user),
            "numMembersAttending": i.get_num_members_attending()
        })

    # Sort the inklings according to their number of attendees
    response_inklings.sort(key = lambda i : i["numMembersAttending"], reverse = True)

    # Create and return a JSON object
    response = simplejson.dumps(response_inklings)
    return HttpResponse(response, mimetype = "application/json")


@login_required
def groups_panel_view(request):
    """Returns a list of the logged-in member's groups (with HTML for the panel)."""
    # Get whether or not the groups should automatically be set as selected
    try:
        auto_set_groups_as_selected = (request.POST["autoSetGroupsAsSelected"] == "true")
    except:
        raise Http404()

    # Get the selected groups (if provided)
    try:
        selected_group_ids = request.POST["selectedGroupIds"]
        selected_group_ids = [int(x) for x in selected_group_ids.split(",")]
    except:
        selected_group_ids = []

    # Create a list to hold the response data
    response_groups = []

    # Get an alphabetical list of the logged-in member's groups
    groups = list(request.user.group_set.all())
    groups.sort(key = lambda g : g.name)

    # Get a list of the logged-in member's not grouped friends
    not_grouped_members = request.user.get_not_grouped_members(groups, True)

    # Create the "Not Grouped" group
    not_grouped_group = {
        "groupId": -1,
        "name": "Not Grouped",
        "selected": ((auto_set_groups_as_selected) or (-1 in selected_group_ids)),
        "get_member_ids": not_grouped_members
    }

    # Add the "Not Grouped" group to the response list
    response_groups.append({
        "html": get_group_list_item_panel_html(not_grouped_group, not_grouped_members)
    })

    # Get the HTML for the logged-in member's groups
    for g in groups:
        g.selected = ((auto_set_groups_as_selected) or (g.id in selected_group_ids))

        response_groups.append({
            "groupId": g.id,
            "html": get_group_list_item_panel_html(g)
        })

    # Create and return a JSON object
    response = simplejson.dumps(response_groups)
    return HttpResponse(response, mimetype = "application/json")


@login_required
def groups_main_content_view(request):
    """Returns a list of the logged-in member's groups (with HTML for the main content window)."""
    # Create a list to hold the response data
    response_groups = []

    # Get an alphabetical list of the logged-in member's groups
    groups = list(request.user.group_set.all())
    groups.sort(key = lambda g : g.name)

    # Get a list of the logged-in member's not grouped friends
    not_grouped_members = request.user.get_not_grouped_members(groups)

    # Create the "Not Grouped" group
    not_grouped_group = {
        "id": -1,
        "name": "Not Grouped"
    }

    # Add the "Not Grouped" group to the response list
    response_groups.append({
        "groupId": not_grouped_group["id"],
        "groupName": "*" + not_grouped_group["name"],
        "html": get_group_list_item_main_content_html(not_grouped_group, not_grouped_members)
    })

    # Get the HTML for the logged-in member's groups
    for g in groups:
        response_groups.append({
            "groupId": g.id,
            "groupName": g.name,
            "html": get_group_list_item_main_content_html(g)
        })

    # Create and return a JSON object
    response = simplejson.dumps(response_groups)
    return HttpResponse(response, mimetype = "application/json")


# TODO: either delete this if it is not being used or update the function comment for it
@login_required
def inkling_view(request):
    """Returns the HTML for a single inkling"""
    # Get the current inkling and local date (cannot just used datetime.date.today() since that always returns UTC)
    try:
        inkling = Inkling.objects.get(pk = request.POST["inklingId"])
        timezone_offset = int(request.POST["timezoneOffset"])
        today = datetime.datetime.now() - datetime.timedelta(minutes = timezone_offset)
        today = today.date()
    except:
        raise Http404()

    # Determine if the inkling has already occured (to see if it is still editable)
    inkling.is_frozen = False
    if (inkling.date and (today > inkling.date)):
        inkling.is_frozen = True

    # Set the number of member pictures to show for each section
    num_member_pics = 8

    # Get the members who are attending the inkling
    i = 0
    members_attending = []
    if (inkling in request.user.inklings.all()):
        members_attending.append(request.user)
        i = 1

    for m in inkling.get_members_attending():
        if (i == num_member_pics):
            break
        elif (m != request.user):
            members_attending.append(m)
            i = i + 1

    num_other_members_attending = inkling.get_num_members_attending() - i

    # Get the members who are awaiting reply to the inkling
    i = 0
    members_awaiting_reply = []
    if (inkling.member_has_pending_invitation(request.user)):
        members_awaiting_reply.append(request.user)
        i = 1

    for m in inkling.get_members_awaiting_reply():
        if (i == num_member_pics):
            break
        elif (m != request.user):
            members_awaiting_reply.append(m)
            i = i + 1

    num_other_members_awaiting_reply = inkling.get_num_members_awaiting_reply() - i

    # Return the HTML for the current inkling
    return render_to_response("inkling.html", {
            "member": request.user,
            "inkling": inkling,
            "members_attending": members_attending,
            "num_other_members_attending": num_other_members_attending,
            "members_awaiting_reply": members_awaiting_reply,
            "num_other_members_awaiting_reply": num_other_members_awaiting_reply
        },
        context_instance = RequestContext(request)
    )


@login_required
def share_settings_form_view(request):
    """Returns the HTML for a the share settings form."""
    # Return the HTML for the current inkling
    return render_to_response("shareSettingsForm.html",
        {},
        context_instance = RequestContext(request))


@login_required
def set_share_setting_view(request):
    """Sets a users share settings"""
    validSettings = ["shareWithSelectedGroups", "allowInklingAttendeesToShare", "shareGroupByDefault"]
    validValues = ["true", "false"]

    setting = request.POST["setting"]
    value = request.POST["value"].lower()
    group_id = None

    if setting not in validSettings:
        raise Http404()
    if value not in validValues:
        raise Http404()
    if value == validValues[0]:
        value = True
    elif value == validValues[1]:
        value = False

    groups = list(request.user.group_set.all())

    if (setting == validSettings[0]):
        request.user.share_with_selected_groups = value
        request.user.save()
    elif (setting == validSettings[1]):
        request.user.allow_inkling_attendees_to_share = value
        request.user.save()
    elif (setting == validSettings[2]):
        #Ensure the group belongs to the logged in member
        try:
            group_id = request.POST["group_id"]
            group = Group.objects.get(pk=group_id)
            groupCreator = group.creator
        except:
            raise Http404()
        if request.user != groupCreator:
            raise Http404()
        group.share_by_default = value
        group.save()

    groups = list(request.user.group_set.all())

    return HttpResponse("True")


@login_required
def change_password_view(request):
    """Allows a user to change their password."""
    # Get the inputted current password
    try:
        currentPassword = request.POST["currentPassword"]
        newPassword1 = request.POST["newPassword1"]
        newPassword2 = request.POST["newPassword2"]
    except KeyError as e:
        return HttpResponse("Error accessing request POST data: " + e.message)

    # Create a string to hold the login error
    response_error = ""

    # Validate the current and new password
    if ((not currentPassword) and (not newPassword1)):
        response_error = "A current and new password must be specified"
    elif (not currentPassword):
        response_error = "Current password not specified"
    elif (not newPassword1):
        response_error = "New password not specified"
    elif (len(newPassword1) < 8):
        response_error = "New password must contain at least eight characters"
    elif (newPassword1 != newPassword2):
        response_error = "New password and confirm password do not match"
    elif (currentPassword == newPassword1):
        response_error = "New password must be different than current password"

    if (not response_error): #If there is no error with supplying the required data
        if (request.user.check_password(currentPassword)):
            request.user.set_password(newPassword1)
            request.user.save()
        else:
            response_error = "Current password not valid"

    # Create and return a JSON object
    response = simplejson.dumps({
        "success": response_error == "",
        "error": response_error
    })

    return HttpResponse(response, mimetype = "application/json")


@login_required
def reset_password_view(request):
    """Allows a user to reset their password."""
    # Get the POST data
    try:
        email = request.POST["email"]
        pin = request.POST["pin"]
        newPassword1 = request.POST["newPassword1"]
        newPassword2 = request.POST["newPassword2"]
    except KeyError as e:
        return HttpResponse("Error accessing request POST data: " + e.message)

    # Create a string to hold the login error
    response_error = ""

    # Validate the current and new password
    if (not newPassword1):
        response_error = "New password not specified"
    elif (len(newPassword1) < 8):
        response_error = "New password must contain at least eight characters"
    elif (newPassword1 != newPassword2):
        response_error = "New password and confirm password do not match"

    if (not response_error): #If there is no error with supplying the required data
        user = Member.objects.get(email = email)
        if ((not user.is_facebook_member()) and (pin == str(user.password_reset_pin)) and (len(pin) == 6)):
            user.set_password(newPassword1)
            user.password_reset_pin = -1
            user.save()
            user.save()

    # Create and return a JSON object
    response = simplejson.dumps({
        "success": response_error == "",
        "error": response_error
    })

    return HttpResponse(response, mimetype = "application/json")


@login_required
def change_email_view(request):
    """Allows a user to change their email."""
    # Get the inputted current password
    try:
        currentEmail = request.POST["changeEmailCurrentEmail"]
        password = request.POST["changeEmailPassword"]
        newEmail1 = request.POST["changeEmailNewEmail1"]
        newEmail2 = request.POST["changeEmailNewEmail2"]
    except KeyError as e:
        return HttpResponse("Error accessing request POST data: " + e.message)

    # Create a string to hold the login error
    response_error = ""

    # Validate the current and new password
    if (not currentEmail):
        response_error = "Current email not specified"
    elif (not password):
        response_error = "Password not specified"
    elif (not newEmail1):
        response_error = "New email not specified"
    elif (newEmail1 != newEmail2):
        response_error = "New email and confirm email do not match"
    elif (currentEmail == newEmail1):
        response_error = "New email must be different than current email"
    elif (not is_email(newEmail1)):
        response_error = "Invalid email format"
    elif (request.user.email != currentEmail):
        response_error = "Current email not valid"
    elif (Member.objects.filter(email = newEmail1)):
        response_error = "New email not valid."

    if (not response_error): #If there is no error with supplying the required data
        if (request.user.check_password(password)):
            request.user.email = newEmail1
            request.user.save()
        else:
            response_error = "Password not valid"

    # Create and return a JSON object
    response = simplejson.dumps({
        "success": response_error == "",
        "error": response_error
    })

    return HttpResponse(response, mimetype = "application/json")


@login_required
def respond_to_inkling_invitation_view(request):
    """Responds the logged-in member to the an inkling invitation."""
    # Get the inputted inkling, response, and today's date
    try:
        invitation = request.user.inkling_invitations_received.get(pk = request.POST["invitationId"])
        invitation_response = request.POST["invitationResponse"]
        timezone_offset = int(request.POST["timezoneOffset"])
        today = datetime.datetime.now() - datetime.timedelta(minutes = timezone_offset)
        today = today.date()
    except (InklingInvitation.DoesNotExist, KeyError) as e:
        raise Http404()

    # Update the invitation's status
    invitation.status = invitation_response
    invitation.save()

    # Create a variable to hold the response
    response = []

    # Add the inkling corresponding to the current invitation to the logged-in member's inklings if they accepted it
    if (invitation_response == "accepted"):
        request.user.inklings.add(invitation.inkling)

        # Create several date objects
        tomorrow = today + datetime.timedelta(days = 1)
        this_week = today + datetime.timedelta(days = 6)

        # Get the inkling's grouping index
        if (inkling.date == None):
            grouping_index = 3
        elif (invitation.inkling.date == today):
            grouping_index = 0
        elif (invitation.inkling.date <= tomorrow):
            grouping_index = 1
        elif (invitation.inkling.date <= this_week):
            grouping_index = 2
        else:
            grouping_index = 3

        # Create and return a JSON object
        response = {
            "inklingId": invitation.inkling.id,
            "html": get_inkling_list_item_html(invitation.inkling, request.user),
            "groupingIndex": grouping_index
        }

    response = simplejson.dumps(response)
    return HttpResponse(response, mimetype = "application/json")


# TODO: possible get rid of this
@login_required
def edit_inkling_view(request):
    """Returns the HTML for editing an inkling."""
    # Get the current inkling
    try:
        inkling = Inkling.objects.get(pk = request.POST["inklingId"])
    except:
        raise Http404()

    # Return the HTML for editing the current inkling
    return render_to_response("editInkling.html",
        { "inkling" : inkling },
        context_instance = RequestContext(request))


@login_required
def save_inkling_view(request):
    """Saves any changes to an inkling and returns the HTML for that inkling's page."""
    # Get the current inkling's new information
    try:
        inkling = Inkling.objects.get(pk = request.POST["inklingId"])
        # TODO: date = request.POST["date"]
        location = request.POST["location"]
        time = request.POST["time"]
        notes = request.POST["notes"]
    except:
        raise Http404()

    # TODO: create date object

    # Create a feed update for everything that changed and update the inkling
    # TODO: uncomment
    if (location != inkling.location):
        feed_update = FeedUpdate.objects.create(creator = member, inkling = inkling, update_type = "location", updated_to = inkling.location)
        inkling.location = location
    #if (date != inkling.date):
    #    feed_update = FeedUpdate.objects.create(creator = member, inkling = inkling, update_type = "date", update_to = inkling.date) # TODO: convert to string Day of Week, Month Day
    #    inkling.date = date
    #    inkling.save()
    if (time != inkling.time):
        feed_update = FeedUpdate.objects.create(creator = member, inkling = inkling, update_type = "time", updated_to = inkling.time)
        inkling.time = time
    if (notes != inkling.notes):
        feed_update = FeedUpdate.objects.create(creator = member, inkling = inkling, update_type = "notes", updated_to = inkling.notes)
        inkling.notes = notes

    # Save the inkling
    inkling.save()

    # Return the updated HTML for the inputted inkling
    return render_to_response("inkling.html",
        { "inkling": inkling },
        context_instance = RequestContext(request) )


@login_required
def join_inkling_view(request):
    """Adds the logged in member to an inkling."""
    # Get the current inkling
    try:
        inkling = Inkling.objects.get(pk = request.POST["inklingId"])
    except:
        raise Http404()

    # Add the inkling to the logged-in member's inklings
    request.user.inklings.add(inkling)

    return HttpResponse()


@login_required
def inkling_feed_view(request):
    """Returns a list of the feed updates and comments for the inputted inkling."""
    # Get the current inkling and the timezone offset
    try:
        inkling = Inkling.objects.get(pk = request.POST["inklingId"])
    except:
        raise Http404()

    # Create a list to hold all the feed items (comments and updates)
    response_feed_items = []

    # Add the inkling creation feed update to the response list
    html = render_to_string("inklingFeedUpdateListItem.html", {
        "inkling": inkling
    })

    response_feed_items.append({
        "html": html,
        "date": inkling.date_created
    })

    # Add the feed comments to the response list
    for feed_comment in inkling.feedcomment_set.all():
        html = render_to_string("inklingFeedCommentListItem.html", {
            "feed_comment": feed_comment
        })

        response_feed_items.append({
            "html": html,
            "date": feed_comment.date_created
        })

    # Add the feed updates to the response list
    for feed_update in inkling.feedupdate_set.all():
        html = render_to_string("inklingFeedUpdateListItem.html", {
            "feed_update": feed_update
        })

        response_feed_items.append({
            "html": html,
            "date": feed_update.date_created
        })

    # Sort the feed items chronologically
    response_feed_items.sort(key = lambda feed_item : feed_item["date"])
    for feed_item in response_feed_items:
        del feed_item["date"]

    # Create and return a JSON object
    response = simplejson.dumps(response_feed_items)
    return HttpResponse(response, mimetype = "application/json")


@login_required
def inkling_members_attending_view(request):
    """Returns a list of the members who are attending the inputted inkling."""
    # Get the current inkling
    try:
        inkling = Inkling.objects.get(pk = request.POST["inklingId"])
    except:
        raise Http404()

    # Create a list to hold all the members attending the current inkling
    response_members_attending = []
    for m in inkling.get_members_attending():
        m.num_mutual_friends = request.user.get_num_mutual_friends(m)

        html = render_to_string("memberListItem.html", {
            "m": m
        })

        response_members_attending.append({
            "memberId": m.id,
            "lastName": m.last_name,
            "html": html
        })

    # Create and return a JSON object
    response = simplejson.dumps(response_members_attending)
    return HttpResponse(response, mimetype = "application/json")


@login_required
def inkling_members_awaiting_reply_view(request):
    """Returns a list of the members who have been invited to the inputted inkling but have not responded yet."""
    # Get the current inkling
    try:
        inkling = Inkling.objects.get(pk = request.POST["inklingId"])
    except:
        raise Http404()

    # Create a list to hold all the members awaiting reply to the current inkling
    response_members_awaiting_reply = []
    for m in inkling.get_members_awaiting_reply():
        m.num_mutual_friends = request.user.get_num_mutual_friends(m)

        html = render_to_string("memberListItem.html", {
            "m": m
        })

        response_members_awaiting_reply.append({
            "memberId": m.id,
            "lastName": m.last_name,
            "html": html
        })

    # Create and return a JSON object
    response = simplejson.dumps(response_members_awaiting_reply)
    return HttpResponse(response, mimetype = "application/json")


@login_required
def add_feed_comment_view(request):
    """Adds a new comment to the inputted inkling's feed."""
    # Get the current inkling and the new comment's text
    try:
        inkling = Inkling.objects.get(pk = request.POST["inklingId"])
        text = request.POST["text"]
    except:
        raise Http404()

    # Create the new comment
    FeedComment.objects.create(creator = request.user, inkling = inkling, text = text)

    return HttpResponse()


@login_required
def my_inklings_view(request):
    """Returns a list of the inklings which the logged-in member is attending."""
    # Get the current local date (cannot just used datetime.date.today() since that always returns UTC)
    try:
        timezone_offset = int(request.POST["timezoneOffset"])
        today = datetime.datetime.now() - datetime.timedelta(minutes = timezone_offset)
        today = today.date()
    except KeyError:
        raise Http404()

    # Create several date objects
    tomorrow = today + datetime.timedelta(days = 1)
    this_week = today + datetime.timedelta(days = 6)

    # Get a list of all the inklings the logged-in member is attending today
    response_inklings = []
    for i in request.user.inklings.filter(date = today):
        response_inklings.append({
            "inklingId": i.id,
            "html": get_inkling_list_item_html(i, request.user),
            #"numMembersAttending": i.get_num_members_attending(),
            "groupingIndex": 0
        })

    # Get a list of all the inklings the logged-in member is attending tomorrow
    for i in request.user.inklings.filter(date__gt = today).filter(date__lte = tomorrow):
        response_inklings.append({
            "inklingId": i.id,
            "html": get_inkling_list_item_html(i, request.user),
            #"numMembersAttending": i.get_num_members_attending(),
            "groupingIndex": 1
        })

    # Get a list of all the inklings the logged-in member is attending this week
    for i in request.user.inklings.filter(date__gt = tomorrow).filter(date__lte = this_week):
        response_inklings.append({
            "inklingId": i.id,
            "html": get_inkling_list_item_html(i, request.user),
            #"numMembersAttending": i.get_num_members_attending(),
            "groupingIndex": 2
        })

    # Get a list of all the inklings the logged-in member is attending in the future (and sort them by date)
    future_inklings = list(request.user.inklings.filter(date__gte = this_week))
    future_inklings.sort(key = lambda i : i.date)
    for i in future_inklings:
        response_inklings.append({
            "inklingId": i.id,
            "html": get_inkling_list_item_html(i, request.user),
            #"numMembersAttending": i.get_num_members_attending(),
            "groupingIndex": 3
        })

    # Get a list of all the inklings the logged-in member is attending which do not have a date
    for i in request.user.inklings.filter(date__exact = None):
        response_inklings.append({
            "inklingId": i.id,
            "html": get_inkling_list_item_html(i, request.user),
            #"numMembersAttending": i.get_num_members_attending(),
            "groupingIndex": 3
        })

    # Create and return a JSON object
    response = simplejson.dumps(response_inklings)
    return HttpResponse(response, mimetype = "application/json")


@login_required
def num_inkling_invitations_view(request):
    """Returns the number of inklings to which the logged-in member has pending invitations."""
    # Return the number of inklings to which the logged-in member has pending or missed invitations
    return HttpResponse(request.user.inkling_invitations_received.filter(status = "pending").count() + request.user.inkling_invitations_received.filter(status = "missed").count())


@login_required
def inkling_invitations_view(request):
    """Returns a list of the inkling invitations to which the logged-in member has not yet responded."""
    # Get the current inkling and local date (cannot just used datetime.date.today() since that always returns UTC)
    try:
        timezone_offset = int(request.POST["timezoneOffset"])
        today = datetime.datetime.now() - datetime.timedelta(minutes = timezone_offset)
        today = today.date()
    except:
        raise Http404()

    # Get a list of the inklings to which the logged-in member has pending invitations
    response_invitations = []
    for invitation in request.user.inkling_invitations_received.filter(status = "pending"):
        # Mark the invitation if it has been missed
        if (today > invitation.inkling.date):
            invitation.status = "missed"
            invitation.save()

        # Otherwise, add it to the response list
        else:
            html = render_to_string("inklingInvitationListItem.html", {
                "invitation": invitation
            })

            response_invitations.append({
                "invitationId": invitation.id,
                "inklingId": invitation.inkling.id,
                "html": html
            })

    # Add the inklings to which the logged-in members has missed invitations
    for invitation in request.user.inkling_invitations_received.filter(status = "missed"):
        html = render_to_string("inklingInvitationListItem.html", {
            "invitation": invitation
        })

        response_invitations.append({
            "invitationId": invitation.id,
            "inklingId": invitation.inkling.id,
            "html": html
        })

    # Create and return a JSON object
    response = simplejson.dumps(response_invitations)
    return HttpResponse(response, mimetype = "application/json")


@login_required
def create_inkling_view(request):
    """Creates a new inkling."""
    # Get the POST data
    try:
        # Basic information
        location = request.POST["location"]
        date = request.POST["date"]
        time = request.POST["time"]
        notes = request.POST["notes"]

        # Date information
        timezone_offset = int(request.POST["timezoneOffset"])
        date_picker_day = int(request.POST["datePickerDay"])
        date_picker_month = int(request.POST["datePickerMonth"])
        date_picker_year = int(request.POST["datePickerYear"])
        date_picker_date = datetime.date(month = date_picker_month, day = date_picker_day, year = date_picker_year)
        only_include_undated_inklings = request.POST["onlyIncludeUndatedInklings"]
        today = datetime.datetime.now() - datetime.timedelta(minutes = timezone_offset)
        today = today.date()

        # Invited members
        invited_members = request.POST["invitedMemberIds"]
        if (invited_members):
            invited_members = [request.user.friends.get(pk = int(member_id)) for member_id in invited_members.split(",")]

        # Sharing permissions
        groups_shared_with = request.POST["groupsSharedWith"]
        if (groups_shared_with):
            groups_shared_with = [request.user.group_set.get(pk = int(group_id)) for group_id in groups_shared_with.split(",")]
        allow_share_forwarding = (request.POST["allowShareFowarding"] == "true")
    except:
        raise Http404()

    # Create the new inkling
    inkling = Inkling.objects.create(creator = request.user)

    # Update the inkling's information
    if (location):
        inkling.location = location
    if (date):
        date_split = date.split("T")[0].split("-")
        date = datetime.date(month = int(date_split[1]), day = int(date_split[2]), year = int(date_split[0]))
        inkling.date = date
    if (time):
        inkling.time = time
    if (notes):
        inkling.notes = notes

    # Set the inkling's forwarding setting
    inkling.allow_share_forwarding = allow_share_forwarding

    # Save the inkling
    inkling.save()

    # Add the inkling to the logged-in member's inklings
    request.user.inklings.add(inkling)

    # Invite the appropriate members to the inkling
    for m in invited_members:
        # Make sure the inputted member is a friend of the logged-in member
        if (m not in request.user.friends.all()):
            raise Http404()

        # Invite the current member to the new inkling
        InklingInvitation.objects.create(sender = request.user, receiver = m, inkling = inkling)

    # Create a sharing permission object for the inkling creator
    sp = SharingPermission.objects.create(creator = request.user, inkling = inkling)
    for g in groups_shared_with:
        for m in g.members.all():
            sp.members.add(m)

    # Save the sharing permission object
    sp.save()

    # Create a variable to hold the return inkling information
    response = []

    # Create several date objects
    tomorrow = today + datetime.timedelta(days = 1)
    this_week = today + datetime.timedelta(days = 6)

    # Get the inkling's grouping index
    if (inkling.date == None):
        grouping_index = 3
    elif (inkling.date == today):
        grouping_index = 0
    elif (inkling.date <= tomorrow):
        grouping_index = 1
    elif (inkling.date <= this_week):
        grouping_index = 2
    else:
        grouping_index = 3

    # Determine if the date picker date matches the new inkling's date
    if (inkling.date == None):
        add_to_all_inklings_view = only_include_undated_inklings == "true"
    else:
        add_to_all_inklings_view = date_picker_date == inkling.date

    # Create and return a JSON object
    response = {
        "inklingId": inkling.id,
        "html": get_inkling_list_item_html(inkling, request.user),
        "groupingIndex": grouping_index,
        "addToAllInklingsView": add_to_all_inklings_view
    }

    response = simplejson.dumps(response)
    return HttpResponse(response, mimetype = "application/json")


@login_required
def update_inkling_view(request):
    """Updates the inputted inklings details."""
    # Get the current inkling and its details
    try:
        inkling = Inkling.objects.get(pk = request.POST["inklingId"])
        location = request.POST["location"]
        date = request.POST["date"]
        time = request.POST["time"]
        # TODO: remove this from ever being sent
        #category = request.POST["category"]
        notes = request.POST["notes"]
        # TODO: remove this from ever being sent
        #is_private = request.POST["isPrivate"]
        # TODO: add shared_with permissions
    except:
        raise Http404()

    # Update the inkling
    if (location):
        inkling.location = location
    if (date):
        date_split = date.split("T")[0].split("-")
        date = datetime.date(month = int(date_split[1]), day = int(date_split[2]), year = int(date_split[0]))
        inkling.date = date
    if (time):
        inkling.time = time
    if (notes):
        inkling.notes = notes

    # Save the inkling
    inkling.save()

    # Add the inkling to the logged-in member's inklings
    request.user.inklings.add(inkling)

    return HttpResponse()


@login_required
def inkling_invited_groups_view(request):
    """Returns a list of the logged-in member's friends (and whether or not they are invited to the inputted inkling)."""
    # Get the current inkling
    try:
        inkling = Inkling.objects.get(pk = request.POST["inklingId"])
    except (Inkling.DoesNotExist, KeyError) as e:
        raise Http404()

    # Get an alphabetical list of the logged-in member's groups
    groups = list(request.user.group_set.all())
    groups.sort(key = lambda g : g.name)

    # Get a list of the logged-in member's groups
    response_groups = []
    for g in groups:
        g.selected = True
        for m in g.members.all():
            if (not inkling.member_has_pending_invitation(m)):
                g.selected = False
                break

        html = render_to_string("groupListItem.html", {
            "g": g
        })

        response_groups.append({
            "groupId": g.id,
            "html": html
        })

    # Create and return a JSON object
    response = simplejson.dumps(response_groups)
    return HttpResponse(response, mimetype = "application/json")


# TODO: combine this with the other functions which do nearly the same thing...
@login_required
def friends_view(request):
    """Returns a list of the logged-in member's friends."""
    # Get the mode
    try:
        mode = request.POST["mode"]
    except:
        raise Http404()

    # Get the list of the logged-in member's friends
    friends = list(request.user.friends.all())

    # Determine what items to include in the member list item
    include_delete_items = (mode == "friends")
    include_selection_item = (mode == "invite")

    # Get the selected members (if provided)
    try:
        selected_member_ids = [int(x) for x in request.POST["selectedMemberIds"].split(",")]
    except:
        selected_member_ids = []

    # Get the HTML for each of the logged-in member's friends
    response_friends = []
    for m in friends:
        m.num_mutual_friends = m.get_num_mutual_friends(request.user)
        m.selected = m.id in selected_member_ids

        html = render_to_string("memberListItem.html", {
            "m": m,
            "include_delete_items": include_delete_items,
            "include_selection_item": include_selection_item
        })

        response_friends.append({
            "memberId": m.id,
            "lastName": m.last_name,
            "html": html
        })

    # Create and return a JSON object
    response = simplejson.dumps(response_friends)
    return HttpResponse(response, mimetype = "application/json")


@login_required
def friend_requests_view(request):
    """Returns a list of the logged-in member's friend requests."""
    # Get an alphabetical list of the logged-in member's friend requests
    friend_requests = list(request.user.friend_requests_received.filter(status = "pending"))
    friend_requests.sort(key = lambda r : r.sender.last_name)

    # Get the HTML for the logged-in member's friends requests list items
    response_friend_requests = []
    for r in friend_requests:
        m = r.sender
        m.num_mutual_friends = m.get_num_mutual_friends(request.user)

        html = render_to_string("memberListItem.html", {
            "m": m,
            "include_disclosure_arrow": True
        })

        response_friend_requests.append({
            "requestId": m.id,
            "html": html
        })

    # Create and return a JSON object
    response = simplejson.dumps(response_friend_requests)
    return HttpResponse(response, mimetype = "application/json")


@login_required
def num_friend_requests_view(request):
    """Returns the number of pending friend requests the logged-in member has."""
    return HttpResponse(request.user.friend_requests_received.filter(status = "pending").count())

@login_required
def invite_facebook_friends_view(request):
    """Returns a list of the user's facebook friends"""
    try:
        fbAccessToken = request.POST["fbAccessToken"]
        limit = request.POST["limit"]
        offset = request.POST["offset"]
        #startsWith = request.POST["startsWith"]
        #if ((len(startsWith) != 3) and (len(startsWith) != 4)): #Could also allow length to be 0 to allow all facebook friends to be retrieved at once
        #    raise Http404()
    except:
        raise Http404()

    fbData = {"data":[]} #Create empty dictionary of fb data to prevent errors when trying to loop over fb results if the user is not on fb
    if fbAccessToken: #Make call to facebook to query the users friends if an accessToken was given
        fbUrl = "https://graph.facebook.com/fql?q="
        fbQuery = "SELECT uid, name, first_name, last_name, is_app_user, pic_square "
        fbQuery += "FROM user WHERE uid IN "
        fbQuery += "(SELECT uid2 FROM friend WHERE uid1=me()) "
        #if (len(startsWith) >= 3):
        #    fbQuery += str("AND (strpos(lower(last_name),'" + startsWith[0] + "') == 0 ")
        #    fbQuery += str("OR strpos(lower(last_name), '" + startsWith[1] + "') == 0 ")
        #    fbQuery += str("OR strpos(lower(last_name), '" + startsWith[2] + "') == 0 ")
        #    if (len(startsWith) == 3):
        #        fbQuery += ")"
        #    else:
        #        fbQuery += str("OR strpos(lower(last_name), '" + startsWith[3] + "') == 0)")
        #fbQuery += "AND is_app_user=0" #Use this to only return non-inkle users or set to 1 to return only inkle users
        fbQuery += str("LIMIT " + str(limit) + " ")
        fbQuery += str("OFFSET " + str(offset))
        print fbQuery

        if fbQuery:
            fbRequest = fbUrl + urllib2.quote(fbQuery) + "&access_token=" + fbAccessToken
            try:
                fbResponse = urllib2.urlopen(fbRequest).read()
            except Exception, e:
                print "Error reading facebook response: " + str(e)
            fbData = simplejson.loads(fbResponse)

    facebookFriendsTuple = getFriendsFromFacebookData(request.user, fbData)
    #Facebook friends who are also inkle users
    facebookInkle = facebookFriendsTuple[0] + facebookFriendsTuple[1] + facebookFriendsTuple[2] + facebookFriendsTuple[3]
    #Facebook friends of the user who are not members of inkle
    facebookNotInkle = facebookFriendsTuple[4]

    facebookInkleSorted = []
    facebookNotInkleSorted = []
    if facebookInkle:
        facebookInkleSorted = sorted(facebookInkle, key = lambda m : m.last_name)
    if facebookNotInkle:
        facebookNotInkleSorted = sorted(facebookNotInkle, key = lambda m : m['last_name'])

    #Merge the two lists into one
    facebookFriends = []
    inkleIndex = 0
    facebookIndex = 0
    while (inkleIndex < len(facebookInkleSorted) and facebookIndex < len(facebookNotInkleSorted)):
        if facebookNotInkleSorted[facebookIndex]["last_name"] < facebookInkleSorted[inkleIndex].last_name:
            facebookFriends.append(facebookNotInkleSorted[facebookIndex])
            facebookIndex += 1
        else:
            facebookFriends.append(facebookInkleSorted[inkleIndex])
            inkleIndex += 1
    if inkleIndex < len(facebookInkleSorted):
        facebookFriends += facebookInkleSorted[inkleIndex:]
    if facebookIndex < len(facebookNotInkleSorted):
        facebookFriends += facebookNotInkleSorted[facebookIndex:]

    response_members = []
    for m in facebookFriends:
        try:
            html = render_to_string("memberListItem.html", {
            "m" : m,
            "include_disclosure_arrow" : False,
            "include_facebook_icon" : True,
            "include_relationship_tag" : True,
            "relationship_tag_source" : "inviteFacebookFriends", #This must be unique per view as it is used to generate IDs for the relationship tag
            })
        except:
            raise Http404()

        try: #inkle user
            lastName = m.last_name
            userId = m.id
            if m.facebook_id:
                facebook_id = m.facebook_id
            else:
                facebook_id = "none"
            if m.is_friend:
                relationship = "friend"
            elif m.is_pending:
                relationship = "pending"
            elif m.is_requested:
                relationship = "requested"
            else:
                relationship = "none"
        except: #Facebook friends not on inkle
            lastName = m["last_name"]

            userId = "none"
            facebook_id = m["facebook_id"]
            if m["is_friend"]:
                relationship = "friend"
            elif m["is_pending"]:
                relationship = "pending"
            elif m["is_requested"]:
                relationship = "requested"
            else:
                relationship = "facebookOnlyFriend"

        response_members.append({
            "memberId": userId,
            "lastName": lastName,
            "facebookId": facebook_id,
            "relationship": relationship,
            "html": html
        })
    # Create and return a JSON object
    response = simplejson.dumps(response_members)
    return HttpResponse(response, mimetype = "application/json")


@login_required
def people_search_view(request):
    """Returns a list of member's who match the inputted query."""
    # Get the search query
    try:
        query = request.POST["query"]
        fbAccessToken = request.POST["fbAccessToken"]
    except:
        raise Http404()

    # Split the query into words
    query_split = query.split()

    fbData = {"data":[]} #Create empty dictionary of fb data to prevent errors when trying to loop over fb results if the user is not on fb
    if fbAccessToken: #Make call to facebook to query the users friends if an accessToken was given
        fbUrl = "https://graph.facebook.com/fql?q="
        fbQuery = "SELECT uid, name, first_name, last_name, is_app_user, pic_square "
        fbQuery += "FROM user WHERE uid IN "
        fbQuery += "(SELECT uid2 FROM friend WHERE uid1=me()) "
        #fbQuery += "AND is_app_user=0" #Use this to only return non-inkle users or set to 1 to return only inkle users
        if (len(query_split) == 1):
            fbQuery += str("AND (strpos(lower(first_name),'" + query_split[0] + "') == 0 ")
            fbQuery += str("OR strpos(lower(last_name), '" + query_split[0] + "') == 0)")
        elif (len(query_split) == 2):
            fbQuery += str("AND ( (strpos(lower(first_name),'" + query_split[0] + "') == 0 ")
            fbQuery += str("AND strpos(lower(last_name), '" + query_split[1] + "') == 0 )")
            fbQuery += str("OR (strpos(lower(first_name), '" + query_split[1] + "') == 0 ")
            fbQuery += str("AND strpos(lower(last_name), '" + query_split[0] + "') == 0))")
        else:
            fbQuery = ""
        if fbQuery:
            fbRequest = fbUrl + urllib2.quote(fbQuery) + "&access_token=" + fbAccessToken
            try:
                fbResponse = urllib2.urlopen(fbRequest).read()
            except Exception, e:
                print "Error reading facebook response: " + str(e)
            fbData = simplejson.loads(fbResponse)

    facebookFriendsTuple = getFriendsFromFacebookData(request.user, fbData)
    #Users of inkle who are friends with the user on inkle and on facebook
    facebookInkleFriends = facebookFriendsTuple[0]
    #Users of inkle who are friends with the user on facebook and who have a pending request from the user on inkle
    facebookInklePending = facebookFriendsTuple[1]
    #Users of inkle who are friends with the user on facebook and who have requested to be riends with the user on inkle
    facebookInkleRequested = facebookFriendsTuple[2]
    #Users of inkle who are facebook friends with the user but for which there is no relationship or pending relationship on inkle
    facebookInkleOther = facebookFriendsTuple[3]
     #Facebook friends of the user who are not members of inkle
    facebookNotInkle = facebookFriendsTuple[4]

    # If the query is only one word long, match the members' first or last names alone
    if (len(query_split) == 1):
        members = Member.objects.filter(Q(first_name__istartswith = query) | Q(last_name__istartswith = query))
    # If the query is two words long, match the members' first and last names
    elif (len(query_split) == 2):
        members = Member.objects.filter((Q(first_name__istartswith = query_split[0]) & Q(last_name__istartswith = query_split[1])) | (Q(first_name__istartswith = query_split[1]) & Q(last_name__istartswith = query_split[0])))
    # If the query is more than two words long, return no results
    else:
        members = []

    inkleFriendsTuple = categorizeInkleMembers(request.user, members, facebookFriendsTuple)
    #Users of inkle who are inkle friends with the user but not on facebook
    inkleFriends = inkleFriendsTuple[0]
    #Users of inkle who have a pending request from the user but are not facebook friends
    inklePending = inkleFriendsTuple[1]
    #Users of inkle who have requested to be friends with the user but are not facebook friends
    inkleRequested = inkleFriendsTuple[2]
    #Users of inkle who are are not friends with the user and do not have a pending request nor are they facebook friends
    inkleOther = inkleFriendsTuple[3]

    friends = facebookInkleFriends + inkleFriends
    pending = facebookInklePending + inklePending
    requested = facebookInkleRequested + inkleRequested

    searchResults = []
    if inkleFriends:
        searchResults += sorted(friends, key = lambda m : m.last_name)
    if inklePending:
        searchResults += sorted(pending, key = lambda m : m.last_name)
    if inkleRequested:
        searchResults += sorted(requested, key = lambda m : m.last_name)
    if facebookInkleOther:
        searchResults += sorted(facebookInkleOther, key = lambda m : m.last_name)
    if facebookNotInkle:
        searchResults += sorted(facebookNotInkle, key = lambda m : m['last_name'])
    if inkleOther:
        searchResults += sorted(inkleOther, key = lambda m : m.last_name)
    response_members = []
    for m in searchResults:
        try:
            #html = render_to_string("addFriendItem.html", {
            html = render_to_string("memberListItem.html", {
            "m" : m,
            "include_disclosure_arrow" : True,
            "include_facebook_icon" : True,
            "include_relationship_tag" : True,
            "relationship_tag_source" : "addFriends", #This must be unique per view as it is used to generate IDs for the relationship tag
            })
        except:
            raise Http404()

        try: #inkle user
            userId = m.id
            if m.facebook_id:
                facebook_id = m.facebook_id
            else:
                facebook_id = "none"
            if m.is_friend:
                relationship = "friend"
            elif m.is_pending:
                relationship = "pending"
            elif m.is_requested:
                relationship = "requested"
            else:
                relationship = "none"
        except: #Facebook friends not on inkle
            userId = "none"
            facebook_id = m["facebook_id"]
            if m["is_friend"]:
                relationship = "friend"
            elif m["is_pending"]:
                relationship = "pending"
            elif m["is_requested"]:
                relationship = "requested"
            else:
                relationship = "facebookOnlyFriend"

        response_members.append({
            "memberId": userId,
            "facebookId": facebook_id,
            "relationship": relationship,
            "html": html
        })

    # Create and return a JSON object
    response = simplejson.dumps(response_members)
    return HttpResponse(response, mimetype = "application/json")

def getFriendsFromFacebookData(member, fbData):
    """Returns a categorized tuple of facebook users. The first item is a list of facebook friends who are also inkle friends with the user,
    the second is a list of facebook friends who the user has a pending inkle friend request to,
    the third is a list of facebook friends who have a pending friend request to the user,
    the fourth is a list of facebook friends who are on inkle but have no relationship to the user,
    and the fifth is a list of facebook friends not on inkle inkle."""

    facebookInkleFriends = []
    facebookInklePending = []
    facebookInkleRequested = []
    facebookInkleOther = []
    facebookNotInkle = []
    for fbFriend in fbData["data"]:
        #Use try block in case they have authenticated the inkle app on facebook but
        #don't have an inkle account or have not linked their inkle account to facebook
        try:
            if (not fbFriend["is_app_user"]): #If the facebook friend is not an inkle member
                raise Exception("inkle app is not added to user's facebook account")
            #Get inkle user from facebook user id
            facebookInkleUser = Member.objects.get(facebook_id = fbFriend["uid"]) #This will throw an exception if no inkle member exists
            facebookInkleUser.num_mutual_friends = member.get_num_mutual_friends(facebookInkleUser)
            facebookInkleUser.is_friend = False #Default to false
            facebookInkleUser.is_pending = False #Default to false
            facebookInkleUser.is_requested = False #Default to false
            if (facebookInkleUser in member.friends.all()):
                facebookInkleUser.is_friend = True
                facebookInkleFriends.append(facebookInkleUser)
            elif member.has_pending_friend_request_to(facebookInkleUser):
                facebookInkleUser.is_pending = True
                facebookInklePending.append(facebookInkleUser)
            elif facebookInkleUser.has_pending_friend_request_to(member):
                facebookInkleUser.is_requested = True
                facebookInkleRequested.append(facebookInkleUser)
            else:
                facebookInkleOther.append(facebookInkleUser)
        except Exception, e:
            personData = {} #Create dictionary for facebook friend data
            personData["first_name"] = fbFriend["first_name"]
            personData["last_name"] = fbFriend["last_name"]
            personData["facebook_id"] = fbFriend["uid"]
            personData["num_mutual_friends"] = 0
            personData["is_friend"] = False
            personData["is_pending"] = False
            personData["is_requested"] = False
            personData["get_picture_path"] = fbFriend["pic_square"]
            facebookNotInkle.append(personData)
    return (facebookInkleFriends, facebookInklePending, facebookInkleRequested, facebookInkleOther, facebookNotInkle)

def categorizeInkleMembers(member, memberList, facebookFriendsTuple):
    """Returns a categorized tuple of inkle users not on facebook. The first item is a list of inkle friends,
    the second is a list of members who the user has a pending request to,
    the third is a list of members who have a pending request to the user,
    and the fourth is a list of all other inkle members"""

    inkleFriends = []
    inklePending = []
    inkleRequested = []
    inkleOther = []

    facebookInkleFriends = facebookFriendsTuple[0]
    facebookInklePending = facebookFriendsTuple[1]
    facebookInkleRequested = facebookFriendsTuple[2]
    facebookInkleOther = facebookFriendsTuple[3]
    facebookNotInkle = facebookFriendsTuple[4]

    for m in memberList:
        m.num_mutual_friends = member.get_num_mutual_friends(m)
        m.is_friend = False #Default to false
        m.is_pending = False #Default to false
        m.is_requested = False #Default to false
        if ((m in member.friends.all()) and (m not in facebookInkleFriends)): #If the member is a friend of the user
            m.is_friend = True
            inkleFriends.append(m)
        elif (member.has_pending_friend_request_to(m) and (m not in facebookInklePending)):
            m.is_pending = True
            inklePending.append(m)
        elif (m.has_pending_friend_request_to(member) and (m not in facebookInkleRequested)):
            m.is_requested = True
            inkleRequested.append(m)
        elif ((not m.facebook_id) and (m not in facebookInkleOther)):  #If the member matches the search query but is not friends with the user and a request is not pending, and they are not a facebook user
            inkleOther.append(m)
    return (inkleFriends, inklePending, inkleRequested, inkleOther)

@login_required
def facebook_post(request):
    """Posts an invitation message on a users facebook feed"""
    # Get the search query
    try:
        fbId = request.POST["fbId"]
        fbId = fbId.strip('f').strip('b')
        fbAccessToken = request.POST["fbAccessToken"]
    except:
        print "except1: " + str(e)
        raise Http404()

    fbData = {"data":[]} #Create empty dictionary of fb data to prevent errors when trying to loop over fb results if the user is not on fb
    if fbAccessToken: #Make call to facebook to query the users friends if an accessToken was given
        postInfo = "https://graph.facebook.com/" + fbId + "/feed?"
        postInfo += "link=https://developers.facebook.com/docs/reference/dialogs/&"
        postInfo += "picture=http://fbrell.com/f8.jpg&"
        postInfo += "name=Facebook%20Dialogs&"
        postInfo += "caption=Reference%20Documentation&"
        postInfo += "description=Using%20Dialogs%20to%20interact%20with%20users.&"
        postInfo += "access_token=" + fbAccessToken
        try:
            #req = urllib2.Request(postInfo)
            #return urllib2.urlopen(req)
            fbResponse = urllib2.urlopen(postInfo).read()
        except Exception, e:
            print "except2: " + str(e)
        #fbData = simplejson.loads(fbResponse)
        #print fbData
    return HttpResponse()


# TODO: rename as send_friend_request_view
@login_required
def add_friend_view(request):
    """Sends a friend request from the logged-in member to the inputted member."""
    # Get the member to whom the logged-in member is sending the friend request
    try:
        m = Member.objects.get(pk = request.POST["memberId"])
    except:
        raise Http404()

    # Make sure the two members are not already friends and no friend request already exists
    if ((m in request.user.friends.all()) or (request.user.has_pending_friend_request_to(m))):
        raise Http404()

    # Send a friend request from the logged-in member
    FriendRequest.objects.create(sender = request.user, receiver = m)

    return HttpResponse()


@login_required
def respond_to_request_view(request):
    """Implements the logged-in member's response to a friend request from the inputted memeber."""

    # Get the member who sent the request and the logged-in member's response to it
    try:
        m = Member.objects.get(pk = request.POST["memberId"])
        friend_request_response = request.POST["response"]
    except:
        raise Http404()

    # Make sure the two members are not already friends, there is not already a reciprocal friend request, and the friend request actually exists
    if ((m in request.user.friends.all()) or (request.user.has_pending_friend_request_to(m)) or (not m.has_pending_friend_request_to(request.user))):
        raise Http404()

    # Get the friend request
    # There should only be one pending request at any time but there may be multiple requests (old ones that were ignored, accepted, or revoked)
    friend_request = FriendRequest.objects.get(sender = m, receiver = request.user, status = "pending")

    # update the friend request's status
    friend_request.status = friend_request_response

    # Add the friendship if the logged-in member accepted the request
    if (friend_request.status == "accepted"):
        request.user.friends.add(m)

    # Save the updated friend request
    friend_request.save()

        # Create a variable to hold the response
    response = []

    # Create and return a JSON object
    if (friend_request.status == "accepted"):
        response_friends.append({
            "memberId": m.id,
            "lastName": m.last_name,
            "html": render_to_string("memberListItem.html", {
                "m": m,
                "include_delete_items": True
            })
        })

    response = simplejson.dumps(response)
    return HttpResponse(response, mimetype = "application/json")


@login_required
def revoke_request_view(request):
    """Revokes the logged-in member's friend request to the inputted memeber."""
    # Get the member who sent the request and the logged-in member's response to it
    try:
        m = Member.objects.get(pk = request.POST["userId"])
    except:
        raise Http404()

    # Make sure the friend request actually exists
    if (not request.user.has_pending_friend_request_to(m)):
        raise Http404()

    # Get the friend request
    # There should only be one pending request at any time but there may be multiple requests (old ones that were ignored, accepted, or revoked)
    friend_request = FriendRequest.objects.get(sender = request.user, receiver = m, status = "pending")

    # Set the status as "revoked""
    friend_request.status = "revoked"

    # Save the updated friend request
    friend_request.save()

    # Create and return a JSON object
    response = simplejson.dumps({
        "success": True
    })

    return HttpResponse(response, mimetype = "application/json")

    # Return the number of pending friend requests for the logged-in member
    return HttpResponse(FriendRequest.objects.filter(receiver = request.user, status = "pending").count())


@login_required
def remove_friend_view(request):
    """Removes a friend from the logged-in member's friends list."""
    # Get the member who is to be removed from the logged-in member's friends list
    try:
        m = Member.objects.get(pk = request.POST["memberId"])
    except:
        raise Http404()

    # Make sure the two members are actually friends
    if (m not in request.user.friends.all()):
        raise Http404()

    # Remove the inputted member from the logged-in member's groups
    for group in request.user.group_set.all():
        if (m in group.members.all()):
            group.members.remove(m)

    # Remove the inputted member from the logged-in member's friends list
    request.user.friends.remove(m)

    # Remove the logged-in member from the inputted member's groups
    for group in m.group_set.all():
        if (request.user in group.members.all()):
            group.members.remove(request.user)

    return HttpResponse()


@login_required
def delete_group_view(request):
    """Deletes one of the logged-in member's groups."""
    # Get the inputted group
    try:
        group = Group.objects.get(pk = request.POST["groupId"])
    except:
        raise Http404()

    # Make sure the inputted group is one of the logged-in member's groups
    if (group.creator != request.user):
        raise Http404()

    # Delete the inputted group
    group.delete()

    return HttpResponse()


@login_required
def group_members_view(request):
    """Returns a list of the logged-in member's friends and if they are in the inputted group."""
    # Get the inputted group or set the group to None if we are getting the "Not Grouped" members
    try:
        group = Group.objects.get(pk = request.POST["groupId"])
    except:
        group = None

    # Make sure the inputted group is one of the logged-in member's groups
    if ((group) and (group.creator != request.user)):
        raise Http404()

    # Get a list of the logged-in members friends
    friends = list(request.user.friends.all())
    friends.sort(key = lambda m : m.last_name)  # TODO: try to remove this and just use a sencha sorter

    # Get only the "Not Grouped" members if necessary
    if (not group):
        for g in request.user.group_set.all():
            for m in g.members.all():
                if (m in friends):
                    friends.remove(m)

    # Get the HTML for each of the logged-in member's friends' list item (and whether or not they are in the inputted group)
    response_friends = []
    for m in friends:
        m.num_mutual_friends = request.user.get_num_mutual_friends(m)

        m.selected = (group != None) and (m in group.members.all())
        html = render_to_string("memberListItem.html", {
            "m": m,
            "include_selection_item": (group != None)
        })

        response_friends.append({
            "memberId": m.id,
            "lastName": m.last_name,
            "html": html
        })

    # Create and return a JSON object
    response = simplejson.dumps(response_friends)
    return HttpResponse(response, mimetype = "application/json")


@login_required
def add_to_group_view(request):
    """Adds the inputted member to the inputted group."""
    # Get the inputted group and the member to add to it
    try:
        group = Group.objects.get(pk = request.POST["groupId"])
        m = Member.objects.get(pk = request.POST["memberId"])
    except:
        raise Http404()

    # Make sure the inputted group is one of the logged-in member's groups
    if (group.creator != request.user):
        raise Http404()

    # Add the inputted member to the inputted group
    group.members.add(m)

    return HttpResponse()


@login_required
def remove_from_group_view(request):
    """Removes the inputted member from the inputted group."""
    # Get the inputted group and the member to remove from it
    try:
        group = Group.objects.get(pk = request.POST["groupId"])
        m = Member.objects.get(pk = request.POST["memberId"])
    except:
        raise Http404()

    # Make sure the inputted group is one of the logged-in member's groups
    if (group.creator != request.user):
        raise Http404()

    # Remove the inputted member from the inputted group
    group.members.remove(m)

    return HttpResponse()


@login_required
def create_group_view(request):
    """Creates a new group and adds it to the logged-in member's groups."""
    # Create a new group with no name
    group = Group.objects.create(creator = request.user, name = "")

    # Create a response object for the new group
    response = {
        "groupId": group.id,
        "groupName": "",
        "html": get_group_list_item_main_content_html(group)
    }

    # Create and return a JSON object
    response = simplejson.dumps(response)
    return HttpResponse(response, mimetype = "application/json")


@login_required
def rename_group_view(request):
    """Renames the inputted group."""
    # Get the inputted group and the name to change it to
    try:
        group = Group.objects.get(pk = request.POST["groupId"])
        name = request.POST["name"]
    except:
        raise Http404()

    # Make sure the group belongs to the logged-in member
    if (group.creator != request.user):
        raise Http404()

    # Update and save the inputted group's name
    group.name = name
    group.save()

    # Return the new group's ID
    # TODO: get rid of this?
    return HttpResponse(group.id)
