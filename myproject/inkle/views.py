# HTTP response modules
from django.template import RequestContext
from django.http import HttpResponse, HttpResponseRedirect, Http404
from django.shortcuts import render_to_response
from django.template.loader import render_to_string

# TODO: get rid of the whole csrf_exempt thing
# CSRF exemple views module
from django.views.decorators.csrf import csrf_exempt

# JSON module
from django.utils import simplejson
# URL module
import urllib2

# Inkle database models
from myproject.inkle.models import *

# Regular expression database querying module
from django.db.models import Q

# Date/time module
import datetime

# Regular expression module
import re

import string
import random
import shutil

# TODO: clean up print statements

def is_logged_in(request):
    """Returns True if a user is logged in or False otherwise."""
    return HttpResponse("member_id" in request.session)

@csrf_exempt
def is_facebook_user(request):
    """Returns True if the logged in user is linked to a facebook ID, false otherwise."""
    # Get the logged-in member
    try:
        member = Member.active.get(pk = request.session["member_id"])
    except (Member.DoesNotExist, KeyError) as e:
        raise Http404()
    if member.facebookId:
        return HttpResponse(True)
    return HttpResponse(False)

@csrf_exempt
def login_view(request):
    """Logs a member in or returns the login error."""
    # Get the inputted email and password
    try:
        if ("facebookId" in request.POST):
            facebookId = request.POST["facebookId"]
            facebookAccessToken = request.POST["facebookAccessToken"]
            # Create random password 32 chars long
            password = ''.join(random.choice(string.ascii_letters + string.punctuation + string.digits) for x in range(32))
            first_name = request.POST["first_name"]
            last_name = request.POST["last_name"]
            email = request.POST["email"]
            day = int(request.POST["birthday"].split('/')[1])
            month = int(request.POST["birthday"].split('/')[0])
            year = int(request.POST["birthday"].split('/')[2])
            birthday = datetime.date(day = day, month = month, year = year)
            gender = request.POST["gender"][0]
        else:
            email = request.POST["email"]
            password = request.POST["password"]
            facebookId = False
    except KeyError as e:
        return HttpResponse("Error accessing request POST data: " + e.message)
    
    # Create a string to hold the login error
    response_error = ""

    # Validate the email and password
    if (not facebookId):
        if ((not email) and (not password)):
            response_error = "Email and password not specified"
        elif (not email):
            response_error = "Email not specified"
        elif (not password):
            response_error = "Password not specified"

    # Log in the member if their email and password are correct
    if (not response_error):
        try:
            # Get the member by facebookId
            if (facebookId):
                member = Member.active.get(facebookId = facebookId)
                #Should allow user to update their email if their facebook email doesn't match the one in inkle
            # Get the member according to the provided email
            else:
                member = Member.active.get(email = email)
        except:
            member = []
            
        if (facebookId and not member): #A new member registering facebook (the facebookId was sent but no member object exists for that facebookId)
            print "facebookId and not member"
            try:
                #If the user has not logged in with facebook before but they registered with their email
                member = Member.active.get(email = email)
                if member:
                    print "found member by email"
                    response_error = "A user with that email address already exists. "
                    response_error += "You can link your account to facebook by logging in with your email and going to the settings tab."
                    # Create and return a JSON object
                    response = simplejson.dumps({
                        "success" : False,
                        "error" : response_error
                    })
                    print response
                    return HttpResponse(response, mimetype = "application/json")
            except:
                print "except"
                # Create the new member
                member = Member(
                    facebookId = facebookId,
                    first_name = first_name,
                    last_name = last_name,
                    username = email,
                    email = email,
                    birthday = birthday,
                    gender = gender
                )
                # Set the new member's password
                member.set_password(password)
                member.save() # Save the new member

        # If the user is logging in with facebook, validate their authentication token or log them out
        if (facebookId):
            # Confirm the user is active and log them in
            try:
                if (member and member.is_active):
                    request.session["member_id"] = member.id
                    fbRequest = "https://graph.facebook.com/me?access_token=" + facebookAccessToken
                    fbResponse = urllib2.urlopen(fbRequest).read() # Will throw an exception if access token can't be validated
                    request.session["facebook_access_token"] = facebookAccessToken
                    fbData = simplejson.loads(fbResponse)
                    member.last_login = datetime.datetime.now()
                    member.save()
                # Otherwise, add to the errors list
                else:
                    response_error = "Could not login using Facebook"
            except Exception, e:
                response_error = "Could not login using Facebook"
        else:
            # Confirm the username and password combination and log the member in
            if (member and member.is_active and member.check_password(password)):
                request.session["member_id"] = member.id
                member.last_login = datetime.datetime.now()
                member.save()
            # Otherwise, add to the errors list
            else:
                response_error = "Invalid login combination"

    # Determine if the login was successful
    if (response_error):
        success = False
    else:
        success = True

    # Create and return a JSON object
    response = simplejson.dumps({
        "success" : success,
        "error" : response_error
    })
    # TODO: Do we need this modified thing anymore?
    request.session.modified = True
    return HttpResponse(response, mimetype = "application/json")

def logout_view(request):
    """Logs out the logged-in member."""
    try:
        del request.session["member_id"]
        if ("facebook_access_token" in request.session):
            del request.session["facebook_access_token"]
    except KeyError:
        pass

    return HttpResponse()

def is_email(email):
    """Returns True if the inputted email is a valid email address format; otherwise, returns False."""
    if (re.search(r"[a-zA-Z0-9+_\-\.]+@[0-9a-zA-Z][\.-0-9a-zA-Z]*\.[a-zA-Z]+", email)):
        return True
    else:
        return False

def is_thirteen(month, day, year):
    """Returns True if the inputted date represents a birthday of someone who is at least thirteen; otherwise, returns False."""
    born = datetime.date(day = int(day), month = int(month), year = int(year))
    today = datetime.date.today()
    
    try:
        birthday = born.replace(year = today.year)
    except ValueError:
        birthday = born.replace(year = today.year, day = born.day - 1)
    
    if birthday > today:
        age = today.year - born.year - 1
    else:
        age = today.year - born.year

    if (age < 13):
        return False
    else:
        return True

@csrf_exempt
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
        response_error = "An account already exists for that email."

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
        # TODO: fix this shit
        if (len(email) > 30):
            email = email[0:30]

        birthday = datetime.date(day = day, month = month, year = year)

        # Create the new member
        member = Member(
            first_name = first_name,
            last_name = last_name,
            username = email,
            email = email,
            birthday = datetime.date(day = day, month = month, year = year),
            gender = gender
        )
            
        # Set the new member's password
        member.set_password(password)
        #print member
        
        # Save the new member
        member.save()

        # Create the default image for the new member
        #if (member.gender == "Male"):
        #    shutil.copyfile(MEDIA_ROOT + "images/main/man.jpg", MEDIA_ROOT + "images/members/" + str(member.id) + ".jpg")
        #else:
        #    shutil.copyfile(MEDIA_ROOT + "images/main/woman.jpg", MEDIA_ROOT + "images/members/" + str(member.id) + ".jpg")

        # Log the member in
        request.session["member_id"] = member.id

    # Determine if the login was successful
    if (response_error):
        success = False
    else:
        success = True

    # Create and return a JSON object
    response = simplejson.dumps({
        "success" : success,
        "error" : response_error
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

def get_inkling_list_item_html(inkling):
    """Returns the HTML for an inkling list item."""
    # Get the member thumbnails for those attending the inputted inkling
    num_members_attending = inkling.get_num_members_attending()
    num_members_attending_thumbnails = min(num_members_attending, 5)   # TODO: make 7 a global variable
    members_attending = list(inkling.get_members_attending())[0 : num_members_attending_thumbnails]
    
    # Get the HTML for the inkling list item
    html = render_to_string( "inklingListItem.html", {
        "i" : inkling,
        "members_attending" : members_attending,
        "num_other_members_attending" : num_members_attending - num_members_attending_thumbnails
    })
    
    return html

def get_group_list_item_main_content_html(group, group_members = None):
    """Returns the HTML for a group list item (in the main content)."""
    # Get the group members if this is not the "Not Grouped" group
    if (not group_members):
        group_members = list(group.members.all())

    # Get the member thumbnails for those a part of the inputted group
    num_group_members = len(group_members)
    num_group_member_thumbnails = min(num_group_members, 10)   # TODO: make 7 a global variable
    group_members = group_members[0 : num_group_member_thumbnails]

    # Get the HTML for the group list item
    html = render_to_string( "groupListItemMainContent.html", {
        "g" : group,
        "group_members" : group_members,
        "num_other_group_members" : num_group_members - num_group_member_thumbnails
    })

    return html

def get_group_list_item_panel_html(group, group_members = None):
    """Returns the HTML for a group list item (in a panel)."""
    # Get the group members if this is not the "Not Grouped" group
    if (not group_members):
        group_members = list(group.members.all())

    # Get the HTML for the group list item
    html = render_to_string( "groupListItemPanel.html", {
        "g" : group
    })

    return html

@csrf_exempt
def link_facebook_account_view(request):
    """Links an existing user account to a facebook account."""
    # Get the logged-in member
    try:
        member = Member.active.get(pk = request.session["member_id"])
    except (Member.DoesNotExist, KeyError) as e:
        raise Http404()
    
    # Create a string to hold the login error
    response_error = ""
    
    # Get the facebook credentials
    try:
        if ("facebookId" in request.POST):
            facebookId = request.POST["facebookId"]
            facebookAccessToken = request.POST["facebookAccessToken"]
            first_name = request.POST["first_name"]
            last_name = request.POST["last_name"]
            email = request.POST["email"]
            day = int(request.POST["birthday"].split('/')[1])
            month = int(request.POST["birthday"].split('/')[0])
            year = int(request.POST["birthday"].split('/')[2])
            birthday = datetime.date(day = day, month = month, year = year)
            gender = request.POST["gender"][0]
    except KeyError as e:
        return HttpResponse("Error accessing request POST data: " + e.message)

    # Check for existing member with the facebook ID
    try:
        fbMember = Member.active.get(facebookId = facebookId)
        #NEED TO DECIDE WHAT TO DO IN THIS CASE
    except:
        #There is no existing member with the provided facebook ID
        fbMember = None

    if fbMember is not None:
        response = simplejson.dumps({
            "success" : False,
            "error" : "An inkle account already exists for that facebook user"
        })
        return HttpResponse(response, mimetype = "application/json")

    if (email != member.email):
        # User will need to update their inkle email to match the one in their facebook account
        response_error = "The email address for the facebook account does not match your inkle account email. "
        response_error += "Please update your email in the settings before linking your account to facebook."

    if (fbMember is None):
        try:
            member.facebookId = facebookId #Store their facebookId for future use
            #Replace the users password with a random one - they must login with facebook now
            password = ''.join(random.choice(string.ascii_letters + string.punctuation + string.digits) for x in range(32))
            member.set_password(password)
            member.save()
        except:
            # Error saving member
            HttpResponse("Error saving member object")

    # Validate facebook authentication token or log them out
    # Confirm the user is active and log them in
    try:
        fbRequest = "https://graph.facebook.com/me?access_token=" + facebookAccessToken
        fbResponse = urllib2.urlopen(fbRequest).read() # Will throw an exception if access token can't be validated
        request.session["facebook_access_token"] = facebookAccessToken
        fbData = simplejson.loads(fbResponse)
    except Exception, e:
        response_error = "Could not authenticate with facebook"

    # Determine if the link was successful
    if (response_error):
        success = False
    else:
        success = True

    # Create and return a JSON object
    response = simplejson.dumps({
        "success" : success,
        "error" : response_error
    })
    return HttpResponse(response, mimetype = "application/json")

@csrf_exempt
def all_inklings_view(request):
    """Returns a list of the inklings which the logged-in member's friends are attending."""
    # Get the logged-in member
    try:
        member = Member.active.get(pk = request.session["member_id"])
    except (Member.DoesNotExist, KeyError) as e:
        raise Http404()

    # Determine if we should return dated or no-dated inklings
    try:
        onlyIncludeNoDatedInklings = request.POST["onlyIncludeNoDatedInklings"]
    except:
        onlyIncludeNoDatedInklings = "false"

    # If necessary, get the date, or set it to today if no date is specified
    if (onlyIncludeNoDatedInklings == "false"):
        try:
            day = int(request.POST["day"])
            month = int(request.POST["month"])
            year = int(request.POST["year"])
            date = datetime.date(year, month, day)
        except KeyError:
            date = datetime.date.today()
    else:
        date = None

    # Get a list of the members who are in the groups selected by the logged-in member; otherwise, get all of the logged-in member's friends
    if ("selectedGroupIds" in request.POST):
        selected_group_ids = request.POST["selectedGroupIds"]
        if (selected_group_ids):
            selected_group_ids = selected_group_ids.split(",")[:-1]
        members = get_members_from_groups(member, selected_group_ids)
    else:
        members = list(member.friends.filter(is_active = True))
    
    # Append the logged-in member to the members list
    members.append(member)
    
    # Get the inklings the members are attending on the specified date
    inklings = []
    for m in members:
        for i in m.inklings.filter(date = date):
            if i not in inklings:
                if (m == member):
                    inklings.append(i)
                else:
                    try:
                        sp = SharingPermission.objects.get(creator = m, inkling = i)
                    except:
                        raise Http404()

                    if (member in list(sp.members.all())):  # TODO: change to a "_contains" query if we can?
                        inklings.append(i)

    # Get the HTML for every inkling
    response_inklings = []
    for i in inklings:
        response_inklings.append({
            "id" : i.id,
            "html" : get_inkling_list_item_html(i),
            "numMembersAttending" : i.get_num_members_attending()
        })

    # Sort the inklings according to their number of attendees
    response_inklings.sort(key = lambda i : i["numMembersAttending"], reverse = True)

    # Create and return a JSON object
    response = simplejson.dumps(response_inklings)
    return HttpResponse(response, mimetype = "application/json")


@csrf_exempt
def groups_panel_view(request):
    """Returns a list of the logged-in member's groups (with HTML for the panel)."""
    # Get the logged-in member
    try:
        member = Member.active.get(pk = request.session["member_id"])
    except (Member.DoesNotExist, KeyError) as e:
        raise Http404()

    # Get whether or not the groups should automatically be set as selected
    try:
        auto_set_groups_as_selected = (request.POST["autoSetGroupsAsSelected"] == "true")
    except:
        raise Http404()
    
    # Get the current inkling if we are in the invites view
    if (not auto_set_groups_as_selected):
        try:
            inkling = Inkling.objects.get(pk = request.POST["inklingId"])
        except:
            raise Http404()
    
    # Create a list to hold the response data
    response_groups = []
    
    # Get an alphabetical list of the logged-in member's groups
    groups = list(member.group_set.all())
    groups.sort(key = lambda g : g.name)
    
    # Get a list of the logged-in member's not grouped friends
    not_grouped_members = get_not_grouped_members(member, groups)
    
    # Create the "Not Grouped" group
    not_grouped_group = {
        "id" : -1,
        "name" : "Not Grouped"
    }
    
    # Determine if the "Not Grouped" group should be selected
    not_grouped_group["selected"] = True
    if (not auto_set_groups_as_selected):
        for m in not_grouped_members:
            if (not inkling.member_has_pending_invitation(m)):
                not_grouped_group["selected"] = False
                break
    
    # Add the "Not Grouped" group to the response list
    response_groups.append({
        "html" : get_group_list_item_panel_html(not_grouped_group, not_grouped_members)
    })
    
    # Get the HTML for the logged-in member's groups
    for g in groups:
        
        g.selected = True
        if (not auto_set_groups_as_selected):
            for m in g.members.all():
                if (not inkling.member_has_pending_invitation(m)):
                    g.selected = False
                    break
        
        response_groups.append({
            "id" : g.id,
            "html" : get_group_list_item_panel_html(g)
        })

    # Create and return a JSON object
    response = simplejson.dumps(response_groups)
    return HttpResponse(response, mimetype = "application/json")


def get_not_grouped_members(member, groups = None):
    if (not groups):
        groups = member.group_set.all()

    not_grouped_members = list(member.friends.all())
    for g in groups:
        for m in g.members.all():
            if (m in not_grouped_members):
                not_grouped_members.remove(m)

    return not_grouped_members


@csrf_exempt
def groups_main_content_view(request):
    """Returns a list of the logged-in member's groups (with HTML for the main content window)."""
    # Get the logged-in member
    try:
        member = Member.active.get(pk = request.session["member_id"])
    except (Member.DoesNotExist, KeyError) as e:
        raise Http404()
    
    # Create a list to hold the response data
    response_groups = []

    # Get an alphabetical list of the logged-in member's groups
    groups = list(member.group_set.all())
    groups.sort(key = lambda g : g.name)

    # Get a list of the logged-in member's not grouped friends
    not_grouped_members = get_not_grouped_members(member, groups)
    
    # Create the "Not Grouped" group
    not_grouped_group = {
        "id" : -1,
        "name" : "Not Grouped"
    }

    # Add the "Not Grouped" group to the response list
    response_groups.append({
        "id" : not_grouped_group["id"],
        "html" : get_group_list_item_main_content_html(not_grouped_group, not_grouped_members)
    })

    # Get the HTML for the logged-in member's groups
    for g in groups:
        response_groups.append({
            "id" : g.id,
            "html" : get_group_list_item_main_content_html(g)
        })
    
    # Create and return a JSON object
    response = simplejson.dumps(response_groups)
    return HttpResponse(response, mimetype = "application/json")


@csrf_exempt
def is_member_inkling_view(request):
    """Returns True if the logged-in memeber is attending the inputted inkling."""
    # Get the logged-in member
    try:
        member = Member.active.get(pk = request.session["member_id"])
    except (Member.DoesNotExist, KeyError) as e:
        raise Http404()

    # Get the inputted inkling
    try:
        inkling_id = request.POST["inklingId"]
    except:
        raise Http404()

    # Return True if the logged-in member is attending the inkling or False otherwise
    if (member.inklings.filter(pk = inkling_id)):
        return HttpResponse("True")
    else:
        return HttpResponse("False")


# TODO: either delete this if it is not being used or update the function comment for it
@csrf_exempt
def inkling_view(request):
    """Returns the HTML for a single inkling"""
    # Get the logged-in member
    try:
        member = Member.active.get(pk = request.session["member_id"])
    except (Member.DoesNotExist, KeyError) as e:
        raise Http404()

    # Get the current inkling
    try:
        inkling = Inkling.objects.get(pk = request.POST["inklingId"])
    except:
        raise Http404()

    # Set the number of member pictures to show for each section
    num_member_pics = 8

    # Get the members who are attending the inkling
    i = 0
    members_attending = []
    if (inkling in member.inklings.all()):
        members_attending.append(member)
        i = 1
    
    for m in inkling.get_members_attending():
        if (i == num_member_pics):
            break
        elif (m != member):
            members_attending.append(m)
            i = i + 1

    num_other_members_attending = inkling.get_num_members_attending() - i

    # Get the members who are awaiting reply to the inkling
    i = 0
    members_awaiting_reply = []
    if (inkling.member_has_pending_invitation(member)):
        members_awaiting_reply.append(member)
        i = 1
    
    for m in inkling.get_members_awaiting_reply():
        if (i == num_member_pics):
            break
        elif (m != member):
            members_awaiting_reply.append(m)
            i = i + 1

    num_other_members_awaiting_reply = inkling.get_num_members_awaiting_reply() - i

    # Return the HTML for the current inkling
    return render_to_response( "inkling.html",
        { "member" : member, "inkling" : inkling, "members_attending" : members_attending, "num_other_members_attending" : num_other_members_attending, "members_awaiting_reply" : members_awaiting_reply, "num_other_members_awaiting_reply" : num_other_members_awaiting_reply },
        context_instance = RequestContext(request) )

@csrf_exempt
def share_settings_form_view(request):
    """Returns the HTML for a single inkling"""
    # Get the logged-in member
    try:
        member = Member.active.get(pk = request.session["member_id"])
    except (Member.DoesNotExist, KeyError) as e:
        raise Http404()

    # Return the HTML for the current inkling
    return render_to_response( "shareSettingsForm.html",
        { "member" : member },
        context_instance = RequestContext(request) )

@csrf_exempt
def set_share_setting_view(request, setting = None, value = None, group_id = None):
    """Sets a users share settings"""
    print "setting share settings"
    if ((setting is None) or (value is None)):
        raise Http404()
    if ((setting == "shareGroupByDefault") and (group_id == None)):
        raise Http404()

    # Get the logged-in member
    try:
        member = Member.active.get(pk = request.session["member_id"])
    except (Member.DoesNotExist, KeyError) as e:
        raise Http404()
    
    if (setting == "shareWithSelectedGroups"):
        if (value == "true"):
            member.shareWithSelectedGroups = True
            member.save()
        elif (value == "false"):
            member.shareWithSelectedGroups = False
            member.save()
        else:
            raise Http404()
    elif (setting == "allowInklingAttendeesToShare"):
        if (value == "true"):
            member.allowInklingAttendeesToShare = True
            member.save()
        elif (value == "false"):
            member.allowInklingAttendeesToShare = False
            member.save()
        else:
            raise Http404()
    elif (setting == "shareGroupByDefault"):
        #Ensure the group belongs to the logged in member
        try:
            group = Group.objects.get(pk=group_id)
            groupCreator = group.creator
        except:
            raise Http404()
        if member != groupCreator:
            raise Http404()
        if (value == "true"):
           group.shareByDefault = True
           group.save()
        elif (value == "false"):
            group.shareByDefault = False
            group.save()
        else:
           raise Http404()
    return HttpResponse("True")

@csrf_exempt
def respond_to_inkling_invitation_view(request):
    """Responds the logged-in member to the an inkling invitation."""
    # Get the logged-in member
    try:
        member = Member.active.get(pk = request.session["member_id"])
    except (Member.DoesNotExist, KeyError) as e:
        raise Http404()
    
    # Get the inputted inkling and the response
    try:
        invitation = member.inkling_invitations_received.get(pk = request.POST["invitationId"])
        response = request.POST["response"]
    except (InklingInvitation.DoesNotExist, KeyError) as e:
        raise Http404()

    # Update the invitation's status
    invitation.status = response
    invitation.save()

    # Add the inkling corresponding to the current invitation to the logged-in member's inklings if they accepted it
    if (response == "accepted"):
        member.inklings.add(invitation.inkling)

    # Return the number of pending inkling invitations for the logged-in member
    return HttpResponse(member.inkling_invitations_received.filter(status = "pending").count() + member.inkling_invitations_received.filter(status = "missed").count())


# TODO: possible get rid of this
@csrf_exempt
def edit_inkling_view(request):
    """Returns the HTML for editing an inkling."""
    # Get the logged-in member
    try:
        member = Member.active.get(pk = request.session["member_id"])
    except (Member.DoesNotExist, KeyError) as e:
        raise Http404()

    # Get the current inkling
    try:
        inkling = Inkling.objects.get(pk = request.POST["inklingId"])
    except:
        raise Http404()

    # Return the HTML for editing the current inkling
    return render_to_response( "editInkling.html",
        { "member" : member, "inkling" : inkling },
        context_instance = RequestContext(request) )


@csrf_exempt
def save_inkling_view(request):
    """Saves any changes to an inkling and returns the HTML for that inkling's page."""
    # Get the logged-in member
    try:
        member = Member.active.get(pk = request.session["member_id"])
    except (Member.DoesNotExist, KeyError) as e:
        raise Http404()

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
    return render_to_response( "inkling.html",
        { "member" : member, "inkling" : inkling },
        context_instance = RequestContext(request) )


@csrf_exempt
def join_inkling_view(request):
    """Adds the logged in member to an inkling."""
    # Get the logged-in member
    try:
        member = Member.active.get(pk = request.session["member_id"])
    except (Member.DoesNotExist, KeyError) as e:
        raise Http404()

    # Get the current inkling
    try:
        inkling = Inkling.objects.get(pk = request.POST["inklingId"])
    except:
        raise Http404()

    # Add the inkling to the logged-in member's inklings
    member.inklings.add(inkling)
    
    return HttpResponse()


@csrf_exempt
def inkling_feed_view(request):
    """Returns a list of the feed updates and comments for the inputted inkling."""
    # Get the logged-in member
    try:
        member = Member.active.get(pk = request.session["member_id"])
    except (Member.DoesNotExist, KeyError) as e:
        raise Http404()

    # Get the current inkling
    try:
        inkling = Inkling.objects.get(pk = request.POST["inklingId"])
    except:
        raise Http404()

    # Create a list to hold all the feed items (comments and updates)
    response_feed_items = []

    # Add the inkling creation feed update to the response list
    html = render_to_string( "inklingFeedUpdateListItem.html", {
        "inkling" : inkling,
        "member" : member
    })

    response_feed_items.append({
        "html" : html,
        "date" : inkling.date_created
    })

    # Add the feed comments to the response list
    for feed_comment in inkling.feedcomment_set.all():
        html = render_to_string( "inklingFeedCommentListItem.html", {
            "feed_comment" : feed_comment,
            "member" : member
        })

        response_feed_items.append({
            "html" : html,
            "date" : feed_comment.date_created
        })

    # Add the feed updates to the response list
    for feed_update in inkling.feedupdate_set.all():
        html = render_to_string( "inklingFeedUpdateListItem.html", {
            "feed_update" : feed_update,
            "member" : member
        })

        response_feed_items.append({
            "html" : html,
            "date" : feed_update.date_created
        })


    # Sort the feed items chronologically
    response_feed_items.sort(key = lambda feed_item : feed_item["date"])
    for feed_item in response_feed_items:
        del feed_item["date"]

    # Create and return a JSON object
    response = simplejson.dumps(response_feed_items)
    return HttpResponse(response, mimetype = "application/json")


@csrf_exempt
def inkling_members_attending_view(request):
    """Returns a list of the members who are attending the inputted inkling."""
    # Get the logged-in member
    try:
        member = Member.active.get(pk = request.session["member_id"])
    except (Member.DoesNotExist, KeyError) as e:
        raise Http404()

    # Get the current inkling
    try:
        inkling = Inkling.objects.get(pk = request.POST["inklingId"])
    except:
        raise Http404()

    # Create a list to hold all the members attending the current inkling
    response_members_attending = []
    for m in inkling.get_members_attending():
        m.num_mutual_friends = member.get_num_mutual_friends(m)

        html = render_to_string( "memberListItem.html", {
            "m" : m,
            "member" : member
        })
        
        response_members_attending.append({
            "id" : m.id,
            "lastName" : m.last_name,
            "html": html
        })

    # Create and return a JSON object
    response = simplejson.dumps(response_members_attending)
    return HttpResponse(response, mimetype = "application/json")


@csrf_exempt
def inkling_members_awaiting_reply_view(request):
    """Returns a list of the members who have been invited to the inputted inkling but have not responded yet."""
    print "a"
    # Get the logged-in member
    try:
        member = Member.active.get(pk = request.session["member_id"])
    except (Member.DoesNotExist, KeyError) as e:
        raise Http404()
    print "b"
    # Get the current inkling
    try:
        inkling = Inkling.objects.get(pk = request.POST["inklingId"])
    except:
        raise Http404()
    print "c"
    # Create a list to hold all the members awaiting reply to the current inkling
    response_members_awaiting_reply = []
    for m in inkling.get_members_awaiting_reply():
        m.num_mutual_friends = member.get_num_mutual_friends(m)
        
        html = render_to_string( "memberListItem.html", {
            "m" : m,
            "member" : member
        })
        
        response_members_awaiting_reply.append({
            "id" : m.id,
            "lastName" : m.last_name,
            "html": html
        })
    print "d"
    # Create and return a JSON object
    response = simplejson.dumps(response_members_awaiting_reply)
    return HttpResponse(response, mimetype = "application/json")


@csrf_exempt
def add_feed_comment_view(request):
    """Adds a new comment to the inputted inkling's feed."""
    # Get the logged-in member
    try:
        member = Member.active.get(pk = request.session["member_id"])
    except (Member.DoesNotExist, KeyError) as e:
        raise Http404()

    # Get the current inkling and the new comment's text
    try:
        inkling = Inkling.objects.get(pk = request.POST["inklingId"])
        text = request.POST["text"]
    except:
        raise Http404()

    # Create the new comment
    FeedComment.objects.create(creator = member, inkling = inkling, text = text)

    return HttpResponse()


# TODO: remove csrf_exempt?
@csrf_exempt
def my_inklings_view(request):
    """Returns a list of the inklings which the logged-in member is attending."""
    # Get the logged-in member
    try:
        member = Member.active.get(pk = request.session["member_id"])
    except (Member.DoesNotExist, KeyError) as e:
        raise Http404()

    # Create several date objects
    today = datetime.date.today()
    tomorrow = today + datetime.timedelta(days = 1)
    this_week = today + datetime.timedelta(days = 6)

    # Get a list of all the inklings the logged-in member is attending today
    response_inklings = []
    for i in member.inklings.filter(date = today):
        response_inklings.append({
            "id" : i.id,
            "html" : get_inkling_list_item_html(i),
            "numMembersAttending" : i.get_num_members_attending(),
            "group" : "Today",
            "groupIndex" : 0
        })

    # Get a list of all the inklings the logged-in member is attending tomorrow
    for i in member.inklings.filter(date__gt = today).filter(date__lte = tomorrow):
        response_inklings.append({
            "id" : i.id,
            "html" : get_inkling_list_item_html(i),
            "numMembersAttending" : i.get_num_members_attending(),
            "group" : "Tomorrow",
            "groupIndex" : 1
        })

    # Get a list of all the inklings the logged-in member is attending this week
    for i in member.inklings.filter(date__gt = tomorrow).filter(date__lte = this_week):
        response_inklings.append({
            "id" : i.id,
            "html" : get_inkling_list_item_html(i),
            "numMembersAttending" : i.get_num_members_attending(),
            "group" : "This Week",
            "groupIndex" : 2
        })

    # Get a list of all the inklings the logged-in member is attending in the future (and sort them by date)
    future_inklings = list(member.inklings.filter(date__gte = this_week))
    future_inklings.sort(key = lambda i : i.date)
    for i in future_inklings:
        response_inklings.append({
            "id" : i.id,
            "html" : get_inkling_list_item_html(i),
            "numMembersAttending" : i.get_num_members_attending(),
            "group" : "Future",
            "groupIndex" : 3
        })

    # Get a list of all the inklings the logged-in member is attending which do not have a date
    for i in member.inklings.filter(date__exact = None):
        response_inklings.append({
            "id" : i.id,
            "html" : get_inkling_list_item_html(i),
            "numMembersAttending" : i.get_num_members_attending(),
            "group" : "Future",
            "groupIndex" : 3
        })

    # Create and return a JSON object
    response = simplejson.dumps(response_inklings)
    return HttpResponse(response, mimetype = "application/json")


def num_inkling_invitations_view(request):
    """Returns the number of inklings to which the logged-in member has pending invitations."""
    # Get the logged-in member
    try:
        member = Member.active.get(pk = request.session["member_id"])
    except (Member.DoesNotExist, KeyError) as e:
        raise Http404()
    
    # Return the number of inklings to which the logged-in member has pending invitations
    return HttpResponse(member.inkling_invitations_received.filter(status = "pending").count() + member.inkling_invitations_received.filter(status = "missed").count())


@csrf_exempt
def inkling_invitations_view(request):
    """Returns a list of the inkling invitations to which the logged-in member has not yet responded."""
    # Get the logged-in member
    try:
        member = Member.active.get(pk = request.session["member_id"])
    except (Member.DoesNotExist, KeyError) as e:
        raise Http404()
    
    # Get a list of the inklings to which the logged-in member has pending invitations
    response_invitations = []
    for invitation in member.inkling_invitations_received.filter(status = "pending"):
        html = render_to_string( "inklingInvitationListItem.html", {
            "invitation" : invitation
        })
        
        response_invitations.append({
            "invitationId" : invitation.id,
            "inklingId" : invitation.inkling.id,
            "html": html
        })

    # Add the inklings to which the logged-in members has missed invitations
    for invitation in member.inkling_invitations_received.filter(status = "missed"):
        html = render_to_string( "inklingInvitationListItem.html", {
            "invitation" : invitation
        })
        
        response_invitations.append({
            "invitationId" : invitation.id,
            "inklingId" : invitation.inkling.id,
            "html": html
        })
    
    # Create and return a JSON object
    response = simplejson.dumps(response_invitations)
    return HttpResponse(response, mimetype = "application/json")


# TODO: I think this can now be removed since invitations have been modeled differently
@csrf_exempt
def create_inkling_view(request):
    """Creates an empty inkling."""
    # Get the logged-in member
    try:
        member = Member.active.get(pk = request.session["member_id"])
    except (Member.DoesNotExist, KeyError) as e:
        raise Http404()

    # Create a new inkling
    inkling = Inkling.objects.create(creator = member)

    # Return the new inkling's ID
    return HttpResponse(inkling.id)


@csrf_exempt
def update_inkling_view(request):
    """Updates the inputted inklings details."""
    # Get the logged-in member
    try:
        member = Member.active.get(pk = request.session["member_id"])
    except (Member.DoesNotExist, KeyError) as e:
        raise Http404()

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
    member.inklings.add(inkling)

    return HttpResponse()


# TODO: fix this; invites should not occur until the inkling is actually created; therefore, this should no longer work...
@csrf_exempt
def num_invited_friends_view(request):
    """Returns the number of friends who have been invited to the inputted inkling."""
    # Get the logged-in member
    try:
        member = Member.active.get(pk = request.session["member_id"])
    except (Member.DoesNotExist, KeyError) as e:
        raise Http404()

    # Get the current inkling
    try:
        inkling = Inkling.objects.get(pk = request.POST["inklingId"])
    except:
        raise Http404()

    # Get the number of friends who have been invited to this inkling by the logged-in member
    num_invited_friends = InklingInvitation.objects.filter(sender = member, inkling = inkling).count()
    
    return HttpResponse(num_invited_friends)


@csrf_exempt
def inkling_invited_friends_view(request):
    """Returns a list of the logged-in member's friends (and whether or not they are invited to the inputted inkling)."""
    # Get the logged-in member
    try:
        member = Member.active.get(pk = request.session["member_id"])
    except (Member.DoesNotExist, KeyError) as e:
        raise Http404()

    # Get the current inkling
    try:
        inkling = Inkling.objects.get(pk = request.POST["inklingId"])
    except:
        raise Http404()

    # Get the logged-in member's friends
    friends = list(member.friends.all())

    # Get a list of the logged-in member's friends
    response_friends = []
    for m in friends:
        m.selected = inkling.member_has_pending_invitation(m)

        html = render_to_string( "memberListItem.html", {
            "m" : m,
            "member" : member,
            "include_selection_item" : True
        })
        
        response_friends.append({
            "id" : m.id,
            "lastName" : m.last_name,
            "html": html
        })
    
    # Create and return a JSON object
    response = simplejson.dumps(response_friends)
    return HttpResponse(response, mimetype = "application/json")


@csrf_exempt
def inkling_invited_groups_view(request):
    """Returns a list of the logged-in member's friends (and whether or not they are invited to the inputted inkling)."""
    # Get the logged-in member
    try:
        member = Member.active.get(pk = request.session["member_id"])
    except (Member.DoesNotExist, KeyError) as e:
        raise Http404()

    # Get the current inkling
    try:
        inkling = Inkling.objects.get(pk = request.POST["inklingId"])
    except (Inkling.DoesNotExist, KeyError) as e:
        raise Http404()

    # Get an alphabetical list of the logged-in member's groups
    groups = list(member.group_set.all())
    groups.sort(key = lambda g : g.name)

    # Get a list of the logged-in member's groups
    response_groups = []
    for g in groups:
        g.selected = True
        for m in g.members.all():
            if (not inkling.member_has_pending_invitation(m)):
                g.selected = False
                break

        html = render_to_string( "groupListItem.html", {
            "g" : g
        })

        response_groups.append({
            "id" : g.id,
            "html" : html
        })

    # Create and return a JSON object
    response = simplejson.dumps(response_groups)
    return HttpResponse(response, mimetype = "application/json")


@csrf_exempt
def invite_group_view(request):
    """Invites everyone in the inputted group to the inputted inkling."""
    # Get the logged-in member
    try:
        member = Member.active.get(pk = request.session["member_id"])
    except (Member.DoesNotExist, KeyError) as e:
        raise Http404()

    # Get the inputted inkling and group
    try:
        inkling = Inkling.objects.get(pk = request.POST["inklingId"])
        group = Group.objects.get(pk = request.POST["itemId"])
    except:
        raise Http404()

    # Make sure the group belongs to the logged-in member
    if (group.creator != member):
        raise Http404()

    # Invite everyone in the inputted group to the inputted inkling if they have not yet been invited
    for m in group.members.all():
        if (not inkling.member_has_pending_invitation(m)):
            InklingInvitation.objects.create(sender = member, receiver = m, inkling = inkling)

    return HttpResponse()


@csrf_exempt
def uninvite_group_view(request):
    """Uninvites everyone in the inputted group from the inputted inkling."""
    # Get the logged-in member
    try:
        member = Member.active.get(pk = request.session["member_id"])
    except (Member.DoesNotExist, KeyError) as e:
        raise Http404()

    # Get the inputted inkling and group and the groups which are currently selected by the logged-in member
    try:
        inkling = Inkling.objects.get(pk = request.POST["inklingId"])
        group = Group.objects.get(pk = request.POST["itemId"])
        selected_group_ids = request.POST["selectedGroupIds"]
    except:
        raise Http404()

    # Get a list of the groups which are currently selected by the logged-in member
    selected_groups = []
    if (selected_group_ids):
        for group_id in selected_group_ids.split(",")[:-1]:
            try:
                g = Group.objects.get(pk = int(group_id))
            except:
                raise Http404()
            if (g.creator != member):
                raise Http404()
            selected_groups.append(g)

    # Loop through each member in the inputted group and remove their invitation if they are not part of any selected group
    for m in group.members.all():
        if (inkling.member_has_pending_invitation(m)):
            remove = True
            for b in selected_groups:
                if (m in b.members.all()):
                    remove = False
                    break

            if (remove):
                try:
                    invitation = InklingInvitation.objects.get(sender = member, receiver = m, inkling = inkling)
                    invitation.delete()
                except:
                    raise Http404()

    return HttpResponse()


@csrf_exempt
def invite_member_view(request):
    """Invites the inputted member to the inputted inkling."""
    # Get the logged-in member
    try:
        member = Member.active.get(pk = request.session["member_id"])
    except (Member.DoesNotExist, KeyError) as e:
        raise Http404()

    # Get the inputted inkling and member
    try:
        inkling = Inkling.objects.get(pk = request.POST["inklingId"])
        m = Member.objects.get(pk = request.POST["itemId"])
    except:
        raise Http404()

    # Make sure the inputted member is a friend of the logged-in member
    if (m not in member.friends.all()):
        raise Http404()
    
    # Invite the inputted member to the inputted inkling if they have not already been invited
    if (not inkling.member_has_pending_invitation(m)):
        InklingInvitation.objects.create(sender = member, receiver = m, inkling = inkling)

    return HttpResponse()


@csrf_exempt
def uninvite_member_view(request):
    """Uninvites the inputted member from the inputted inkling."""
    # Get the logged-in member
    try:
        member = Member.active.get(pk = request.session["member_id"])
    except (Member.DoesNotExist, KeyError) as e:
        raise Http404()

    # Get the inputted inkling and member
    try:
        inkling = Inkling.objects.get(pk = request.POST["inklingId"])
        m = Member.objects.get(pk = request.POST["itemId"])
    except:
        raise Http404()

    # Make sure the inputted member is a friend of the logged-in member
    if (m not in member.friends.all()):
        raise Http404()
    
    # Uninvite the inputted member from the inputted inkling
    try:
        invitation = InklingInvitation.objects.get(sender = member, receiver = m, inkling = inkling)
        invitation.delete()
    except:
        raise Http404()

    return HttpResponse()


# TODO: combine this with the other functions which do nearly the same thing...
@csrf_exempt
def friends_view(request):
    """Returns a list of the logged-in member's friends."""
    # Get the logged-in member
    try:
        member = Member.active.get(pk = request.session["member_id"])
    except (Member.DoesNotExist, KeyError) as e:
        raise Http404()
    
    # Get the mode
    try:
        mode = request.POST["mode"]
    except:
        raise Http404()
    
    # Get the list of the logged-in member's friends
    friends = list(member.friends.all())
    
    # Determine what items to include in the member list item
    include_delete_items = (mode == "friends")
    include_selection_item = (mode == "invite")
    
    # Get the HTML for each of the logged-in member's friends
    response_friends = []
    for m in friends:
        m.num_mutual_friends = member.get_num_mutual_friends(m)

        html = render_to_string( "memberListItem.html", {
            "m" : m,
            "member" : member,
            "include_delete_items" : include_delete_items,
            "include_selection_item" : include_selection_item
        })
        
        response_friends.append({
            "id" : m.id,
            "lastName" : m.last_name,
            "html": html
        })
    
    # Create and return a JSON object
    response = simplejson.dumps(response_friends)
    return HttpResponse(response, mimetype = "application/json")


@csrf_exempt
def friend_requests_view(request):
    """Returns a list of the logged-in member's friend requests."""
    # Get the logged-in member
    try:
        member = Member.active.get(pk = request.session["member_id"])
    except (Member.DoesNotExist, KeyError) as e:
        raise Http404()

    # Get an alphabetical list of the logged-in member's friend requests
    friend_requests = list(member.friend_requests_received.filter(status = "pending"))
    friend_requests.sort(key = lambda r : r.sender.last_name)

    # Get the HTML for the logged-in member's friends requests list items
    response_friend_requests = []
    for request in friend_requests:
        m = request.sender
        m.num_mutual_friends = m.get_num_mutual_friends(m)
        
        html = render_to_string( "memberListItem.html", {
            "m" : m,
            "member" : member,
            "include_friend_request_buttons" : True
        })
        
        response_friend_requests.append({
            "id" : m.id,
            "html": html
        })

    # Create and return a JSON object
    response = simplejson.dumps(response_friend_requests)
    return HttpResponse(response, mimetype = "application/json")


@csrf_exempt
def num_friend_requests_view(request):
    """Returns the number of pending friend requests the logged-in member has."""
    # Get the logged-in member
    try:
        member = Member.active.get(pk = request.session["member_id"])
    except (Member.DoesNotExist, KeyError) as e:
        raise Http404()

    # Return the number of pending friend requests the logged-in member has
    return HttpResponse(member.friend_requests_received.filter(status = "pending").count())


# TODO: definitely delete this
@csrf_exempt
def profile_view(request):
    """Returns the HTML for the profile page."""
    # Get the logged-in member
    try:
        member = Member.active.get(pk = request.session["member_id"])
    except (Member.DoesNotExist, KeyError) as e:
        raise Http404()

    # Return the HTML for the profile page
    return render_to_response( "profile.html",
        { "member" : member },
        context_instance = RequestContext(request) )

@csrf_exempt
def invite_facebook_friends_view(request):
    """Returns a list of a member's facebook friends so they can invite or add them"""
    # Get the logged-in member
    try:
        member = Member.active.get(pk = request.session["member_id"])
    except (Member.DoesNotExist, KeyError) as e:
        raise Http404()
    # Get the search query
    try:
        fbAccessToken = request.POST["fbAccessToken"]
    except:
        raise Http404()

    fbData = {"data":[]} #Create empty dictionary of fb data to prevent errors when trying to loop over fb results if the user is not on fb
    if fbAccessToken: #Make call to facebook to query the users friends if an accessToken was given
        fbUrl = "https://graph.facebook.com/fql?q="
        fbQuery = "SELECT uid, name, first_name, last_name, is_app_user, pic_square "
        fbQuery += "FROM user WHERE uid IN "
        fbQuery += "(SELECT uid2 FROM friend WHERE uid1=me()) "
        if fbQuery:
            fbRequest = fbUrl + urllib2.quote(fbQuery) + "&access_token=" + fbAccessToken
            try:
                fbResponse = urllib2.urlopen(fbRequest).read()
            except Exception, e:
                print "except: " + str(e)
            fbData = simplejson.loads(fbResponse)

    facebookInkleFriends = [] #List of facebook friends who are also on inkle
    facebookOnlyFriends = [] #List of facebook friends who are not on inkle
    for fbFriend in fbData["data"]:
        if fbFriend["is_app_user"]: #If the facebook friend is an inkle member
            #Get inkle user from facebook user id
            inkleUser = Member.objects.get(facebookId = fbFriend["uid"]) #Will throw error if no member object exists with the given facebookId
            if inkleUser not in member.friends.all(): #If the facebook friend is not an inkle friend
                inkleUser.is_friend = False
                inkleUser.is_pending = member.has_pending_friend_request_to(inkleFriend)
            else: #If the facebook friend is an inkle friend
                inkleUser.is_friend = True
            inkleUser.num_mutual_friends = member.get_num_mutual_friends(inkleFriend)
            facebookInkleFriends.append(inkleUser)
        else: #If the facebook friend is not an inkle member
            personData = {} #Create dictionary for facebook friend data
            personData["first_name"] = fbFriend["first_name"]
            personData["last_name"] = fbFriend["last_name"]
            personData["facebookId"] = fbFriend["uid"]
            #Users not on inkle don't have an id so use their facebook id pre-pending with 'fb' instead
            personData["id"] = "fb" + str(fbFriend["uid"])
            personData["num_mutual_friends"] = 0
            personData["is_friend"] = False
            personData["is_pending"] = False
            personData["get_picture_path"] = fbFriend["pic_square"]
            facebookOnlyFriends.append(personData)
    #Sort each individual list of friends
    facebookInkleFriends = sorted(facebookInkleFriends, key = lambda m : m.last_name)
    facebookOnlyFriends = sorted(facebookOnlyFriends, key = lambda m : m["last_name"])
    #Merge the two lists into one
    facebookFriends = []
    inkleIndex = 0
    facebookIndex = 0
    while (inkleIndex < len(facebookInkleFriends) and facebookIndex < len(facebookOnlyFriends)):
        if facebookOnlyFriends[facebookIndex]["last_name"] < facebookInkleFriends[inkleIndex].last_name:
            facebookFriends.append(facebookOnlyFriends[facebookIndex])
            facebookIndex += 1
        else:
            facebookFriends.append(facebookInkleFriends[inkleIndex])
            inkleIndex += 1
    if inkleIndex < len(facebookInkleFriends):
        facebookFriends += facebookInkleFriends[inkleIndex:]
    if facebookIndex < len(facebookOnlyFriends):
        facebookFriends += facebookOnlyFriends[facebookIndex:]
    # Get the HTML for each of the logged-in member's facebook friends
    response_friends = []
    for m in facebookFriends:
        html = render_to_string( "addFriendItem.html", {
            "m" : m,
        })
        try:
            personId = m.id
            lastName = m.last_name
        except:
            personId = m["id"]
            lastName = m["last_name"]
        response_friends.append({
            "id" : personId,
            "lastName" : lastName,
            "html": html
        })
    
    # Create and return a JSON object
    response = simplejson.dumps(response_friends)
    return HttpResponse(response, mimetype = "application/json")

@csrf_exempt
def people_search_view(request):
    """Returns a list of member's who match the inputted query."""
    # Get the logged-in member
    try:
        member = Member.active.get(pk = request.session["member_id"])
    except (Member.DoesNotExist, KeyError) as e:
        raise Http404()
    # Get the search query
    try:
        query = request.POST["query"]
        fbAccessToken = request.POST["fbAccessToken"]
    except:
        print "except1: " + str(e)
        raise Http404()

    # Split the query into words
    query_split = query.split()

    # If the query is only one word long, match the members' first or last names alone
    if (len(query_split) == 1):
        members = Member.objects.filter(Q(first_name__istartswith = query) | Q(last_name__istartswith = query))
    # If the query is two words long, match the members' first and last names
    elif (len(query_split) == 2):
        members = Member.objects.filter((Q(first_name__istartswith = query_split[0]) & Q(last_name__istartswith = query_split[1])) | (Q(first_name__istartswith = query_split[1]) & Q(last_name__istartswith = query_split[0])))
    # If the query is more than two words long, return no results
    else:
        members = []

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
                print "except2: " + str(e)
            fbData = simplejson.loads(fbResponse)      

    # Create lists for storing member objects or dictionaries for each type
    # of connection a member can have to the user
    inkleFriends = [] #Members of inkle who are friends on inkle with the user
    inklePending = [] #Members of inkle who have a pending request from the user
    inkleOther = [] #Members of inkle who are are not friends with the user and do not have a pending request
    facebookInkle = [] #Members of inkle who are facebook friends with the user
    facebookNotInkle = [] #Facebook friends of the user who are not members of inkle

    for m in members:
        m.num_mutual_friends = member.get_num_mutual_friends(m)
        if m in member.friends.all(): #If the member is a friend of the user
            m.is_friend = True
            m.is_pending = False
            inkleFriends.append(m)
        elif member.has_pending_friend_request_to(m):
            m.is_friend = False
            m.is_pending = True
            inklePending.append(m)
        else: #If the member matches the search query but is not friends with the user and a request is not pending
            m.is_friend = False
            m.is_pending = False
            inkleOther.append(m)

    for fbFriend in fbData["data"]:
        if fbFriend["is_app_user"]: #If the facebook friend is an inkle member
            #Get inkle user from facebook user id
            inkleFriend = Member.objects.get(facebookId = fbFriend["uid"])
            if inkleFriend not in inkleFriends: #If the facebook friend is not an inkle friend
                inkleFriend.num_mutual_friends = member.get_num_mutual_friends(inkleFriend)
                inkleFriend.is_friend = False
                inkleFriend.is_pending = member.has_pending_friend_request_to(inkleFriend)
                facebookInkle.append(personData)
        else: #If the facebook friend is not an inkle member
            personData = {} #Create dictionary for facebook friend data
            personData["first_name"] = fbFriend["first_name"]
            personData["last_name"] = fbFriend["last_name"]
            personData["facebookId"] = fbFriend["uid"]
            #Users not on inkle don't have an id so use their facebook id pre-pending with 'fb' instead
            personData["id"] = "fb" + str(fbFriend["uid"])
            personData["num_mutual_friends"] = 0
            personData["is_friend"] = False
            personData["is_pending"] = False
            personData["get_picture_path"] = fbFriend["pic_square"]
            facebookNotInkle.append(personData)
    
    searchResults = []
    if inkleFriends:
        searchResults += sorted(inkleFriends, key = lambda m : m.last_name)
    if inklePending:
        searchResults += sorted(inklePending, key = lambda m : m.last_name)
    if facebookInkle:
        searchResults += sorted(facebookInkle, key = lambda m : m.last_name)
    if facebookNotInkle:
        searchResults += sorted(facebookNotInkle, key = lambda m : m['last_name']) 
    if inkleOther:
        searchResults += sorted(inkleOther, key = lambda m : m.last_name)          
    
    response_members = []
    for m in searchResults:
        try:
            html = render_to_string( "addFriendItem.html", {
            "m" : m,
            "member" : member,
            })
        except:
            raise Http404()

        try:
            memberId = m.id
        except:
            memberId = m["id"]
        response_members.append({
            "id" : memberId,
            "html": html
        })
        
    # Create and return a JSON object
    response = simplejson.dumps(response_members)
    return HttpResponse(response, mimetype = "application/json")

@csrf_exempt
def facebook_post(request):
    """Posts an invitation message on a users facebook feed"""

    # Get the logged-in member
    try:
        member = Member.active.get(pk = request.session["member_id"])
    except (Member.DoesNotExist, KeyError) as e:
        raise Http404()

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
        fbData = simplejson.loads(fbResponse)
        print fbData
    return HttpResponse()

# TODO: rename as send_friend_request_view
@csrf_exempt
def add_friend_view(request):
    """Sends a friend request from the logged-in member to the inputted member."""
    # Get the logged-in member
    try:
        member = Member.active.get(pk = request.session["member_id"])
    except (Member.DoesNotExist, KeyError) as e:
        raise Http404()

    # Get the member to whom the logged-in member is sending the friend request
    try:
        m = Member.objects.get(pk = request.POST["memberId"])
    except:
        raise Http404()

    # Make sure the two members are not already friends and no friend request already exists
    if ((m in member.friends.all()) or (member.has_pending_friend_request_to(m))):
        raise Http404()

    # Send a friend request from the logged-in member
    FriendRequest.objects.create(sender = member, receiver = m)

    return HttpResponse()


@csrf_exempt
def respond_to_request_view(request):
    """Implements the logged-in member's response to a friend request from the inputted memeber."""
    # Get the logged-in member
    try:
        member = Member.active.get(pk = request.session["member_id"])
    except (Member.DoesNotExist, KeyError) as e:
        raise Http404()

    # Get the member who sent the request and the logged-in member's response to it
    try:
        m = Member.objects.get(pk = request.POST["memberId"])
        response = request.POST["response"]
    except:
        raise Http404()

    # Make sure the two members are not already friends and that the friend request actually exists
    if ((m in member.friends.all()) or (member.has_pending_friend_request_to(m))):
        raise Http404()

    # Get the friend request
    friend_request = FriendRequest.objects.get(sender = m, receiver = member)

    # Add the friendship if the logged in member accepted the request
    if (response == "accept"):
        member.friends.add(m)
        friend_request.status = "accepted"
    else:
        friend_request.status = "declined"
    
    # Save the updated friend request
    friend_request.save()

    # Return the number of pending friend requests for the logged-in member
    return HttpResponse(FriendRequest.objects.filter(receiver = member, status = "pending").count())


@csrf_exempt
def remove_friend_view(request):
    """Removes a friend from the logged-in member's friends list."""
    # Get the logged-in member
    try:
        member = Member.active.get(pk = request.session["member_id"])
    except (Member.DoesNotExist, KeyError) as e:
        raise Http404()

    # Get the member who is to be removed from the logged-in member's friends list
    try:
        m = Member.objects.get(pk = request.POST["memberId"])
    except:
        raise Http404()

    # Make sure the two members are actually friends
    if (m not in member.friends.all()):
        raise Http404()

    # Remove the inputted member from the logged-in member's groups
    for group in member.group_set.all():
        if (m in group.members.all()):
            group.members.remove(m)

    # Remove the inputted member from the logged-in member's friends list
    member.friends.remove(m)

    return HttpResponse()


@csrf_exempt
def delete_group_view(request):
    """Deletes one of the logged-in member's groups."""
    # Get the logged-in member
    try:
        member = Member.active.get(pk = request.session["member_id"])
    except (Member.DoesNotExist, KeyError) as e:
        raise Http404()

    # Get the inputted group
    try:
        group = Group.objects.get(pk = request.POST["groupId"])
    except:
        raise Http404()

    # Make sure the inputted group is one of the logged-in member's groups
    if (group.creator != member):
        raise Http404()

    # Delete the inputted group
    group.delete()
    
    return HttpResponse()


@csrf_exempt
def group_members_view(request):
    """Returns a list of the logged-in member's friends and if they are in the inputted group."""
    # Get the logged-in member
    try:
        member = Member.active.get(pk = request.session["member_id"])
    except (Member.DoesNotExist, KeyError) as e:
        raise Http404()

    # Get the inputted group or set the group to None if we are getting the "Not Grouped" members
    try:
        group = Group.objects.get(pk = request.POST["groupId"])
    except:
        group = None

    # Make sure the inputted group is one of the logged-in member's groups
    if ((group) and (group.creator != member)):
        raise Http404()

    # Get a list of the logged-in members friends
    friends = list(member.friends.all())
    friends.sort(key = lambda m : m.last_name) # TODO: try to remove this and just use a sencha sorter

    # Get only the "Not Grouped" members if necessary
    if (not group):
        for g in member.group_set.all():
            for m in g.members.all():
                if (m in friends):
                    friends.remove(m)

    # Get the HTML for each of the logged-in member's friends' list item (and whether or not they are in the inputted group)
    response_friends = []
    for m in friends:
        m.num_mutual_friends = member.get_num_mutual_friends(m)
        
        m.selected = (m in group.members.all())

        html = render_to_string( "memberListItem.html", {
            "m" : m,
            "member" : member,
            "include_selection_item" : True
        })
        
        response_friends.append({
            "id" : m.id,
            "lastName" : m.last_name,
            "html": html
        })
    
    # Create and return a JSON object
    response = simplejson.dumps(response_friends)
    return HttpResponse(response, mimetype = "application/json")


@csrf_exempt
def add_to_group_view(request):
    """Adds the inputted member to the inputted group."""
    # Get the logged-in member
    try:
        member = Member.active.get(pk = request.session["member_id"])
    except (Member.DoesNotExist, KeyError) as e:
        raise Http404()

    # Get the inputted group and the member to add to it
    try:
        group = Group.objects.get(pk = request.POST["groupId"])
        m = Member.objects.get(pk = request.POST["memberId"])
    except:
        raise Http404()

    # Make sure the inputted group is one of the logged-in member's groups
    if (group.creator != member):
        raise Http404()

    # Add the inputted member to the inputted group
    group.members.add(m)
    
    return HttpResponse()


@csrf_exempt
def remove_from_group_view(request):
    """Removes the inputted member from the inputted group."""
    # Get the logged-in member
    try:
        member = Member.active.get(pk = request.session["member_id"])
    except (Member.DoesNotExist, KeyError) as e:
        raise Http404()

    # Get the inputted group and the member to remove from it
    try:
        group = Group.objects.get(pk = request.POST["groupId"])
        m = Member.objects.get(pk = request.POST["memberId"])
    except:
        raise Http404()

    # Make sure the inputted group is one of the logged-in member's groups
    if (group.creator != member):
        raise Http404()

    # Remove the inputted member from the inputted group
    group.members.remove(m)
    
    return HttpResponse()


# TODO: Remove csrf_exempt
@csrf_exempt
def create_group_view(request):
    """Creates a new group and adds it to the logged-in member's groups."""
    # Get the logged-in member
    try:
        member = Member.active.get(pk = request.session["member_id"])
    except (Member.DoesNotExist, KeyError) as e:
        raise Http404()

    # Create a new group with no name
    group = Group.objects.create(creator = member, name = "")
    
    # Return the new group's ID
    return HttpResponse(group.id)


@csrf_exempt
def rename_group_view(request):
    """Renames the inputted group."""
    # Get the logged-in member
    try:
        member = Member.active.get(pk = request.session["member_id"])
    except (Member.DoesNotExist, KeyError) as e:
        raise Http404()

    # Get the inputted group and the name to change it to
    try:
        group = Group.objects.get(pk = request.POST["groupId"])
        name = request.POST["name"]
    except:
        raise Http404()

    # Make sure the group belongs to the logged-in member
    if (group.creator != member):
        raise Http404()

    # Update and save the inputted group's name
    group.name = name
    group.save()
    
    # Return the new group's ID
    # TODO: get rid of this?
    return HttpResponse(group.id)
