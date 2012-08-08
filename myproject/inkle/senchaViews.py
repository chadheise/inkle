from django.template import RequestContext
from django.http import HttpResponse, HttpResponseRedirect, Http404

from django.shortcuts import render_to_response
from django.template.loader import render_to_string

from django.contrib.auth.models import User
from django.contrib import auth

from django.utils import simplejson

from myproject.inkle.models import *
from myproject.inkle.emails import *

from django.db.models import Q

import datetime
import shutil
#from PIL import Image

from databaseViews import *

from myproject.settings import MEDIA_ROOT

#Modules needed specifically for mobile views
from django.views.decorators.csrf import csrf_exempt
from django.core import serializers
from xml.dom.minidom import parse, parseString
import os
import sys
from views import *

@csrf_exempt
def s_is_logged_in(request):
    """Returns True if the user is logged in; returns false otherwise."""
    if ("member_id" in request.session):
        return HttpResponse("True")
    else:
        return HttpResponse("False")


@csrf_exempt
def s_login_view(request):
    """Either logs in a member or returns the login errors."""
    # Create dictionaries to hold the POST data and the invalid errors
    data = { "email" : "", "password" : "", "month" : 0, "year" : 0 }
    invalid = { "errors" : [] }
    valid = False #Assume invalid data by default

    # If the request type is POST, validate the username and password combination
    if request.method == 'POST':
        try:
            data["email"] = request.POST["email"]
            data["password"] = request.POST["password"]
        except Exception as e:
            return HttpResponse("Error accessing request POST data: " + e.message)
    
        # Validate the email
        if (not data["email"]):
            invalid["email"] = True
            invalid["errors"].append("Email not specified")

        elif (not is_email(data["email"])):
            invalid["email"] = True
            invalid["errors"].append("Invalid email format")

        # Validate the password
        if (not data["password"]):
            invalid["password"] = True
            invalid["errors"].append("Password not specified")

        # If an email and password are provided, the member is verified and active, and their password is correct, log them in (or set the login as invalid)
        if (not invalid["errors"]):
            # Get the member according to the provided email
            try:
                member = Member.active.get(email = data["email"])
            except:
                member = []

            # Confirm the username and password combination
            if (member and (member.verified) and (member.is_active) and (member.check_password(data["password"]))):
                request.session["member_id"] = member.id
                member.last_login = datetime.datetime.now()
                member.save()
            # Otherwise, set the invalid dictionary
            else:
                invalid["email"] = True
                invalid["password"] = True
                invalid["errors"].append("Invalid login combination")

    # Set success attribute
    if invalid["errors"] == []:
        invalid["success"] = True
    else:
        invalid["success"] = False

    # Create JSON object
    response = simplejson.dumps(invalid)
    return HttpResponse(response, mimetype = "application/json")


@csrf_exempt
def s_logout_view(request):
    """Logs out the logged in member."""
    try:
        del request.session["member_id"]
    except KeyError:
        pass

    return HttpResponse()


@csrf_exempt
def s_all_inklings_view(request):
    """Returns all the inklings."""

    # Get the logged in member
    member = Member.active.get(pk = request.session["member_id"])

    # Get the date, or set it to today if no date is specified
    if ("day" in request.POST):
        day = int(request.POST["day"])
        month = int(request.POST["month"])
        year = int(request.POST["year"])
        date = datetime.date(year, month, day)
    else:
        date = datetime.date.today()

    # Get the blot, or set it to all blots if no blot is specified
    if ("blotId" in request.POST):
        blot_id = int(request.POST["blotId"])
        if (blot_id != -1):
            blot = member.blots.get(pk = blot_id)
            members = blot.members.all()
        else:
            members = member.friends.all()
    else:
        members = member.friends.all()

    inklings = []
    for m in members:
        for i in m.inklings.filter(date = date):
            if i not in inklings:
                inklings.append(i)

    return render_to_response( "s_allInklings.html",
        { "inklings" : inklings  },
        context_instance = RequestContext(request) )


@csrf_exempt
def s_is_member_inkling_view(request):
    """Returns True if the inkling is one of the logged in member's inklings."""
    # Get the logged in member
    member = Member.active.get(pk = request.session["member_id"])

    # Get the current inkling id
    inkling_id = request.POST["inklingId"]

    if (member.inklings.filter(pk = inkling_id)):
        return HttpResponse("True")
    else:
        return HttpResponse("False")


@csrf_exempt
def s_inkling_view(request):
    """Returns a single inkling."""
    # Get the logged in member
    member = Member.active.get(pk = request.session["member_id"])

    # Get the current inkling
    inkling_id = request.POST["inklingId"]
    inkling = Inkling.objects.get(pk = inkling_id)

    return render_to_response( "s_inkling.html",
        { "member" : member, "inkling" : inkling },
        context_instance = RequestContext(request) )


@csrf_exempt
def s_edit_inkling_view(request):
    """Returns the HTML for editing an inkling."""
    # Get the logged in member
    member = Member.active.get(pk = request.session["member_id"])

    # Get the current inkling
    inkling_id = request.POST["inklingId"]
    inkling = Inkling.objects.get(pk = inkling_id)

    return render_to_response( "s_editInkling.html",
        { "member" : member, "inkling" : inkling },
        context_instance = RequestContext(request) )


@csrf_exempt
def s_save_inkling_view(request):
    """Saves any changes to an inkling and returns the HTML for that inkling's page."""
    # Get the logged in member
    member = Member.active.get(pk = request.session["member_id"])

    # Get the current inkling
    inkling_id = request.POST["inklingId"]
    inkling = Inkling.objects.get(pk = inkling_id)

    # Get the inkling info
    location = request.POST["location"]
    time = request.POST["time"]
    category = request.POST["category"]
    notes = request.POST["notes"]

    # Create an event for everything that changed
    if (location != inkling.location):
        event = Event(inkling = inkling, member = member, category = "location", text = member.get_full_name() + " updated the location for this inkling to " + location)
        event.save()
        inkling.location = location
    if (time != inkling.time):
        event = Event(inkling = inkling, member = member, category = "time", text = member.get_full_name() + " updated the time for this inkling to " + time)
        event.save()
        inkling.time = time
    if (category != inkling.category):
        event = Event(inkling = inkling, member = member, category = "category", text = member.get_full_name() + " updated the category for this inkling to " + category)
        event.save()
        inkling.category = category
    if (notes != inkling.notes):
        event = Event(inkling = inkling, member = member, category = "notes", text = member.get_full_name() + " updated the notes for this inkling to " + notes)
        event.save()
        inkling.notes = notes

    inkling.save()

    return render_to_response( "s_inkling.html",
        { "member" : member, "inkling" : inkling },
        context_instance = RequestContext(request) )


@csrf_exempt
def s_join_inkling_view(request):
    """Adds the logged in member to an inkling."""
    # Get the logged in member
    member = Member.active.get(pk = request.session["member_id"])

    # Get the current inkling
    inkling_id = request.POST["inklingId"]
    inkling = Inkling.objects.get(pk = inkling_id)

    # Add the inkling to the logged in member's inklings
    member.inklings.add(inkling)
    
    return HttpResponse()


@csrf_exempt
def s_inkling_feed_view(request):
    """Returns the feed for a single inkling."""

    # Get the logged in member
    member = Member.active.get(pk = request.session["member_id"])

    # Get the current inkling
    inkling_id = request.POST["inklingId"]
    inkling = Inkling.objects.get(pk = inkling_id)

    feed_items = []
    for comment in inkling.comment_set.all():
        feed_items.append((comment, "comment"))
    for event in inkling.event_set.all():
        feed_items.append((event, "event"))

    feed_items.sort(key = lambda i : i[0].date_created)

    return render_to_response( "s_inklingFeed.html",
        { "member" : member, "inkling" : inkling, "feedItems" : feed_items },
        context_instance = RequestContext(request) )


@csrf_exempt
def s_post_new_comment_view(request):
    """Posts a new comment to an inkling."""

    # Get the logged in member
    member = Member.active.get(pk = request.session["member_id"])

    # Get the current inkling
    inkling_id = request.POST["inklingId"]
    inkling = Inkling.objects.get(pk = inkling_id)

    # Get the comment text
    text = request.POST["text"]

    # Create the new comment
    comment = Comment(inkling = inkling, creator = member, text = text)
    comment.save()

    # Get the feed items
    feed_items = []
    for comment in inkling.comment_set.all():
        feed_items.append((comment, "comment"))
    for event in inkling.event_set.all():
        feed_items.append((event, "event"))

    feed_items.sort(key = lambda i : i[0].date_created)

    return render_to_response( "s_inklingFeed.html",
        { "member" : member, "inkling" : inkling, "feedItems" : feed_items },
        context_instance = RequestContext(request) )


@csrf_exempt
def s_my_inklings_view(request):
    """Returns the HTML for the logged in user's inklings."""

    # Get the logged in member
    member = Member.active.get(pk = request.session["member_id"])

    # Get date objects
    today = datetime.date.today()
    tomorrow = today + datetime.timedelta(days = 1)
    this_week = today + datetime.timedelta(days = 6)
    
    # Get the logged in member's inklings for each time period
    inklings = []
    inklings.append(["Today", member.inklings.filter(date = datetime.date.today())])
    inklings.append(["Tomorrow", member.inklings.filter(date__gt = today).filter(date__lte = tomorrow)])
    inklings.append(["This Week", member.inklings.filter(date__gt = tomorrow).filter(date__lte = this_week)])
    inklings.append(["Future", member.inklings.filter(date__gte = this_week)])

    return render_to_response( "s_myInklings.html",
        { "inklings" : inklings },
        context_instance = RequestContext(request) )


@csrf_exempt
def s_num_inkling_invites_view(request):
    """Returns the number of inklings to which the logged in member has been invited."""
    # Get the logged in member
    member = Member.active.get(pk = request.session["member_id"])
    
    return HttpResponse(member.invitees_related.count())


@csrf_exempt
def s_inkling_invites_view(request):
    """Returns a list of the inklings to which the logged in member has been invited."""

    # Get the logged in member
    member = Member.active.get(pk = request.session["member_id"])

    # Create a dictionary for the data
    data = {}

    member_inkling_invites = member.invitees_related.all()

    inkling_invites = []
    for i in member_inkling_invites:
        html = render_to_string( "s_inklingInviteListItem.html", {
            "inkling" : i
        })
        
        inkling_invites.append({
            "id" : i.id,
            "html": html
        })
    
    # Add the inkling invites list to the data dictionary
    data["inklingInvites"] = inkling_invites

    # Create and return a JSON object
    response = simplejson.dumps(data)
    return HttpResponse(response, mimetype = "application/json")


@csrf_exempt
def s_create_inkling_view(request):
    """Creates an empty inkling."""

    # Get the logged in member
    member = Member.active.get(pk = request.session["member_id"])

    # Create and save the new inkling
    inkling = Inkling(creator = member)
    inkling.save()

    # Return the new inkling's ID
    return HttpResponse(inkling.id)


@csrf_exempt
def s_update_inkling_view(request):
    """Updates and inkling's information."""

    # Get the logged in member
    member = Member.active.get(pk = request.session["member_id"])

    # Get the POST data
    try:
        location = request.POST["location"]
        date = request.POST["date"]
        time = request.POST["time"]
        category = request.POST["category"]
        notes = request.POST["notes"]
        is_private = request.POST["isPrivate"]
        inkling = Inkling.objects.get(pk = request.POST["inklingId"])
    except:
        raise Http404()
        
    # Set the is_private boolean
    if (is_private == "true"):
        is_private = True
    else:
        is_private = False

    # Add any provided data to the inkling
    if (location):
        inkling.location = location
        inkling.num_location_changes += 1
    if (date):
        # Create a Python date object
        date_split = date.split("T")[0].split("-")
        date = datetime.date(month = int(date_split[1]), day = int(date_split[2]), year = int(date_split[0]))
        inkling.date = date
        inkling.num_date_changes += 1
    if (time):
        inkling.time = time
        inkling.num_time_changes += 1
    if (category):
        inkling.category = category
        inkling.num_category_changes += 1
    if (notes):
        inkling.notes = notes
        inkling.num_notes_changes += 1

    # Save the inkling
    inkling.save()

    # Add the inkling to the logged in member's inkling
    member.inklings.add(inkling)

    # Create and return the JSON object
    data = { "success" : True }
    response = simplejson.dumps(data)
    return HttpResponse(response, mimetype = "application/json")


@csrf_exempt
def s_inkling_blots_invitees_view(request):
    """Returns."""
    # Get the logged in member
    member = Member.active.get(pk = request.session["member_id"])

    try:
        inkling = Inkling.objects.get(pk = request.POST["inklingId"])
    except:
        raise Http404()

    # Create a dictionary for the data
    data = {}

    # Get the name and number of member for each of the logged in member's blots
    blots = []

    html = render_to_string( "s_blotInviteeListItem.html", {
        "allFriendsItem" : True
    })
    blots.append({
        "id" : -1,
        "html" : html
    })


    # Sort the member's blot alphabetically
    member_blots = list(member.blots.all())
    member_blots.sort(key = lambda b : b.name)
    
    for b in member_blots:
        html = render_to_string( "s_blotInviteeListItem.html", {
            "b" : b,
            "allFriendsItem" : False,
            "inkling" : inkling
        })
        blots.append({
            "id" : b.id,
            "html" : html
        })

    data["blots"] = blots

    # Create and return a JSON object
    response = simplejson.dumps(data)
    return HttpResponse(response, mimetype = "application/json")


@csrf_exempt
def s_inkling_friend_invitees_view(request):
    """Returns"""

    # Get the logged in member
    member = Member.active.get(pk = request.session["member_id"])

    try:
        inkling = Inkling.objects.get(pk = request.POST["inklingId"])
    except:
        raise Http404()

    # Create a dictionary for the data
    data = {}

    member_friends = list(member.friends.all())
    member_friends.sort(key = lambda m : m.last_name)

    # Get the name and number of mutual friends for each of the logged in member's friends
    friends = []
    for m in member_friends:
        m.num_mutual_friends = member.get_num_mutual_friends(m)
        html = render_to_string( "s_inklingFriendInvitees.html", {
            "m" : m,
            "inkling" : inkling
        })
        
        friends.append({
            "id" : m.id,
            "lastName" : m.last_name,
            "html": html
        })
    
    # Sort and add the friends list to the data dictionary
    data["friends"] = friends

    # Create and return a JSON object
    response = simplejson.dumps(data)
    return HttpResponse(response, mimetype = "application/json")


@csrf_exempt
def s_num_invitees_view(request):
    """Returns the number of invitees for the inputted inkling."""
    try:
        inkling = Inkling.objects.get(pk = request.POST["inklingId"])
    except:
        raise Http404()

    num_invitees = inkling.invitees.count()
    
    return HttpResponse(num_invitees)


@csrf_exempt
def s_blot_invitees_view(request):
    """."""
    # Get the logged in member
    member = Member.active.get(pk = request.session["member_id"])

    try:
        inkling = Inkling.objects.get(pk = request.POST["inklingId"])
    except:
        raise Http404()

    # Create a dictionary for the data
    data = {}

    # Get the name and number of member for each of the logged in member's blots
    blots = []

    html = render_to_string( "s_blotInviteeListItem.html", {
        "allFriendsItem" : True
    })
    blots.append({
        "id" : -1,
        "html" : html
    })

    # Sort the member's blot alphabetically
    member_blots = list(member.blots.all())
    member_blots.sort(key = lambda b : b.name)
    
    for b in member_blots:
        b.selected = True
        for m in b.members.all():
            if (m not in inkling.invitees.all()):
                b.selected = False
                break
        html = render_to_string( "s_blotInviteeListItem.html", {
            "b" : b,
            "allFriendsItem" : False
        })
        blots.append({
            "id" : b.id,
            "html" : html
        })

    data["blots"] = blots

    # Create and return a JSON object
    response = simplejson.dumps(data)
    return HttpResponse(response, mimetype = "application/json")


@csrf_exempt
def s_inkling_invited_friends_view(request):
    """Returns the logged in member's friends list with information about whether or not they are invited to theprovided inkling."""
    
    # Get the logged in member
    member = Member.active.get(pk = request.session["member_id"])

    try:
        inkling = Inkling.objects.get(pk = request.POST["inklingId"])
    except:
        raise Http404()

    # Create a dictionary for the data
    data = {}

    member_friends = list(member.friends.all())
    member_friends.sort(key = lambda m : m.last_name)

    # Get the name and number of mutual friends for each of the logged in member's friends
    friends = []
    for m in member_friends:
        m.selected = m in inkling.invitees.all()
        html = render_to_string( "s_friendInviteeListItem.html", {
            "m" : m
        })
        
        friends.append({
            "id" : m.id,
            "lastName" : m.last_name,
            "html": html
        })
    
    # Sort and add the friends list to the data dictionary
    data["friends"] = friends

    # Create and return a JSON object
    response = simplejson.dumps(data)
    return HttpResponse(response, mimetype = "application/json")


@csrf_exempt
def s_inkling_invited_blots_view(request):
    """."""
    # Get the logged in member
    member = Member.active.get(pk = request.session["member_id"])

    try:
        inkling = Inkling.objects.get(pk = request.POST["inklingId"])
    except:
        raise Http404()

    # Create a dictionary for the data
    data = {}

    # Get the name and number of member for each of the logged in member's blots
    blots = []

    # Sort the member's blot alphabetically
    member_blots = list(member.blots.all())
    member_blots.sort(key = lambda b : b.name)

    for b in member_blots:
        b.selected = True
        for m in b.members.all():
            if (m not in inkling.invitees.all()):
                b.selected = False
                break
        html = render_to_string( "s_blotInviteeListItem.html", {
            "b" : b
        })
        blots.append({
            "id" : b.id,
            "html" : html
        })

    data["blots"] = blots

    # Create and return a JSON object
    response = simplejson.dumps(data)

    return HttpResponse(response, mimetype = "application/json")


@csrf_exempt
def s_friend_invitees_view(request):
    """Returns the."""

    # Get the logged in member
    member = Member.active.get(pk = request.session["member_id"])

    try:
        inkling = Inkling.objects.get(pk = request.POST["inklingId"])
    except:
        raise Http404()

    # Create a dictionary for the data
    data = {}

    member_friends = list(member.friends.all())
    member_friends.sort(key = lambda m : m.last_name)

    # Get the name and number of mutual friends for each of the logged in member's friends
    friends = []
    for m in member_friends:
        m.selected = m in inkling.invitees.all()
        html = render_to_string( "s_friendInviteeListItem.html", {
            "m" : m
        })
        
        friends.append({
            "id" : m.id,
            "lastName" : m.last_name,
            "html": html
        })
    
    # Sort and add the friends list to the data dictionary
    data["friends"] = friends

    # Create and return a JSON object
    response = simplejson.dumps(data)
    return HttpResponse(response, mimetype = "application/json")


@csrf_exempt
def s_invite_blot_view(request):
    """Invites everyone in a blot to a certain inkling."""
    # Get the logged in member
    member = Member.active.get(pk = request.session["member_id"])

    try:
        blot = Blot.objects.get(pk = request.POST["itemId"])
        inkling = Inkling.objects.get(pk = request.POST["inklingId"])
    except:
        raise Http404()

    for m in blot.members.all():
        if m not in inkling.invitees.all():
            inkling.invitees.add(m)

    inkling.save()

    return HttpResponse()


@csrf_exempt
def s_uninvite_blot_view(request):
    """Uninvites everyone in a blot to a certain inkling."""
    # Get the logged in member
    member = Member.active.get(pk = request.session["member_id"])

    try:
        blot = Blot.objects.get(pk = request.POST["itemId"])
        inkling = Inkling.objects.get(pk = request.POST["inklingId"])
        selected_blot_ids = request.POST["selectedBlotIds"]
    except:
        raise Http404()

    # Get a list of blots which are currently fully selected
    selected_blots = []
    if (selected_blot_ids):
        for blot_id in selected_blot_ids.split(",")[:-1]:
            b = Blot.objects.get(pk = int(blot_id))
            selected_blots.append(b)

    # Loop through each member in the current blot and remove them if they are invited to the current inkling and they are not part of another selected blot
    for m in blot.members.all():
        if (m in inkling.invitees.all()):
            remove = True
            for b in selected_blots:
                if (m in b.members.all()):
                    remove = False
                    break

            if (remove):
                inkling.invitees.remove(m)

    # Save the inkling
    inkling.save()

    return HttpResponse()


@csrf_exempt
def s_invite_member_view(request):
    """Invites one of the logged in member's friends to a certain inkling."""
    # Get the logged in member
    member = Member.active.get(pk = request.session["member_id"])

    try:
        m = Member.objects.get(pk = request.POST["itemId"])
        inkling = Inkling.objects.get(pk = request.POST["inklingId"])
    except:
        raise Http404()

    if m not in inkling.invitees.all():
        inkling.invitees.add(m)
        inkling.save()

    return HttpResponse()


@csrf_exempt
def s_uninvite_member_view(request):
    """Uninvites one of the logged in member's friends to a certain inkling."""
    # Get the logged in member
    member = Member.active.get(pk = request.session["member_id"])

    try:
        m = Member.objects.get(pk = request.POST["itemId"])
        inkling = Inkling.objects.get(pk = request.POST["inklingId"])
    except:
        raise Http404()

    if m in inkling.invitees.all():
        inkling.invitees.remove(m)
        inkling.save()

    return HttpResponse()


@csrf_exempt
def s_friends_view(request):
    """Returns the."""

    # Get the logged in member
    member = Member.active.get(pk = request.session["member_id"])

    try:
        mode = request.POST["mode"]
    except:
        raise Http404()

    # Create a dictionary for the data
    data = {}

    member_friends = list(member.friends.all())
    member_friends.sort(key = lambda m : m.last_name)

    # Get the name and number of mutual friends for each of the logged in member's friends
    friends = []
    for m in member_friends:
        m.num_mutual_friends = member.get_num_mutual_friends(m)
        html = render_to_string( "s_memberListItem.html", {
            "m" : m,
            "include_delete_items" : mode == "friends",
            "include_selection_item" : mode == "invite"
        })
        
        friends.append({
            "id" : m.id,
            "lastName" : m.last_name,
            "html": html
        })
    
    # Sort and add the friends list to the data dictionary
    data["friends"] = friends

    # Create and return a JSON object
    response = simplejson.dumps(data)
    return HttpResponse(response, mimetype = "application/json")


@csrf_exempt
def s_blots_view(request):
    """Returns the HTML for the friends view blots content."""
    # Get the logged in member
    member = Member.active.get(pk = request.session["member_id"])

    try:
        include_all_blots_blot = request.POST["includeAllBlotsBlot"]
        invitees_mode = request.POST["inviteesMode"]
    except:
        raise Http404()

    # Create a dictionary for the data
    data = {}

    # Get the name and number of member for each of the logged in member's blots
    blots = []

    if (include_all_blots_blot == "true"):
        blots.append({
            "text" : "All Blots",
            "value" : -1,
        })
    elif (invitees_mode == "true"):
        html = render_to_string( "s_blotInviteeListItem.html", {
            "allFriendsItem" : True
        })
        blots.append({
            "id" : -1,
            "html" : html
        })


    # Sort the member's blot alphabetically
    member_blots = list(member.blots.all())
    member_blots.sort(key = lambda b : b.name)
    
    for b in member_blots:
        if (include_all_blots_blot == "true"):
            blots.append({
                "text" : b.name,
                "value" : b.id
            })
        elif (invitees_mode == "true"):
            html = render_to_string( "s_blotInviteeListItem.html", {
                "b" : b,
                "allFriendsItem" : False
            })
            blots.append({
                "id" : b.id,
                "html" : html
            })
        else:
            html = render_to_string( "s_blotListItem.html", {
                "b" : b,
            })
            blots.append({
                "id" : b.id,
                "html" : html
            })

    data["blots"] = blots

    # Create and return a JSON object
    response = simplejson.dumps(data)
    return HttpResponse(response, mimetype = "application/json")


@csrf_exempt
def s_friend_requests_view(request):
    """Returns the HTML for the friend requests."""

    # Get the logged in member
    member = Member.active.get(pk = request.session["member_id"])

    # Create a dictionary for the data
    data = {}

    member_friend_requests = list(member.friend_requests.all())
    member_friend_requests.sort(key = lambda m : m.last_name)

    # Get the name and number of mutual friends for each of the logged in member's friend requests
    friend_requests = []
    for m in member_friend_requests:
        m.num_mutual_friends = member.get_num_mutual_friends(m)
        html = render_to_string( "s_friendRequestListItem.html", {
            "m" : m
        })
        
        friend_requests.append({
            "id" : m.id,
            "html": html
        })
    
    # Sort and add the friends list to the data dictionary
    data["friendRequests"] = friend_requests

    # Create and return a JSON object
    response = simplejson.dumps(data)
    return HttpResponse(response, mimetype = "application/json")


@csrf_exempt
def s_num_friend_requests_view(request):
    """Returns the number of members who have requested to be friends with the logged in member."""

    # Get the logged in member
    member = Member.active.get(pk = request.session["member_id"])

    return HttpResponse(member.friend_requests.count())


@csrf_exempt
def s_profile_view(request):
    """Returns the HTML for the logged in user's profile."""

    # Get the logged in member
    member = Member.active.get(pk = request.session["member_id"])
    t =  render_to_response( "s_profile.html",
        { "member" : member },
        context_instance = RequestContext(request) )

    return render_to_response( "s_profile.html",
        { "member" : member },
        context_instance = RequestContext(request) )


@csrf_exempt
def s_people_search_view(request):
    """Returns the people who match the search question."""
    # Get the logged in member
    member = Member.active.get(pk = request.session["member_id"])

    # Get the search query
    try:
        query = request.POST["query"]
    except:
        raise Http404()

    # Create a dictionary for the data
    data = {}

    # Split the query into words
    query_split = query.split()

    # If the query is only one word long, match the members' first or last names alone
    if (len(query_split) == 1):
        members = Member.objects.filter(Q(first_name__istartswith = query) | Q(last_name__istartswith = query))

    # If the query is two words long, match the members' first and last names
    elif (len(query_split) == 2):
        members = Member.objects.filter((Q(first_name__istartswith = query_split[0]) & Q(last_name__istartswith = query_split[1])) | (Q(first_name__istartswith = query_split[1]) & Q(last_name__istartswith = query_split[0])))

    # if the query is more than two words long, return no results
    else:
        members = []
    

    # Sort the members by last name
    members = list(members)
    members.sort(key = lambda m : m.last_name)

    # Get the HTML for each member's list item
    people = []
    for m in members:
        m.num_mutual_friends = member.get_num_mutual_friends(m)
        m.is_friend = False
        if m in member.friends.all():
            m.is_friend = True
        html = render_to_string( "s_memberListItem.html", {
            "m" : m,
            "member" : member,
            "include_add_friend_buttons" : True,
            "include_delete_items" : False,
            "include_selection_item" : False
        })
        
        people.append({
            "id" : m.id,
            "html": html
        })

    # Add the people list to the data dictionary
    data["people"] = people

    # Create and return a JSON object
    response = simplejson.dumps(data)
    return HttpResponse(response, mimetype = "application/json")


@csrf_exempt
def s_add_friend_view(request):
    """Adds a new friend."""
    # Get the logged in member
    member = Member.active.get(pk = request.session["member_id"])

    try:
        m = Member.objects.get(pk = request.POST["memberId"])
    except:
        raise Http404()

    m.friend_requests.add(member)

    return HttpResponse()


@csrf_exempt
def s_respond_to_request_view(request):
    """Adds a new friend."""
    # Get the logged in member
    member = Member.active.get(pk = request.session["member_id"])

    # Get the POST data
    try:
        m = Member.objects.get(pk = request.POST["memberId"])
        response = request.POST["response"]
    except:
        raise Http404()

    # Raise and error if no request exists or the two members are already friends
    if ((m not in member.friend_requests.all()) or (m in member.friends.all())):
        raise Http404()

    # Add the friendship if the logged in member accepted the request
    if (response == "accept"):
        member.friends.add(m)

    # Remove the friend request
    member.friend_requests.remove(m)

    return HttpResponse(member.friend_requests.count())


@csrf_exempt
def s_remove_friend_view(request):
    """Removes a friend."""
    # Get the logged in member
    member = Member.active.get(pk = request.session["member_id"])

    try:
        m = Member.objects.get(pk = request.POST["memberId"])
    except:
        raise Http404()

    for blot in member.blots.all():
        if m in blot.members.all():
            blot.members.remove(m)

    try:
        member.friends.remove(m)
    except:
        raise Http404()

    return HttpResponse()


@csrf_exempt
def s_delete_blot_view(request):
    """Deletes a blot."""
    # Get the logged in member
    member = Member.active.get(pk = request.session["member_id"])

    try:
        blot = Blot.objects.get(pk = request.POST["blotId"])
    except:
        raise Http404()

    try:
        member.blots.remove(blot)
    except:
        raise Http404()

    blot.delete()
    
    return HttpResponse()


@csrf_exempt
def s_blot_members_view(request):
    """Returns the."""

    # Get the logged in member
    member = Member.active.get(pk = request.session["member_id"])

    # Get the blot
    try:
        blot = Blot.objects.get(pk = request.POST["blotId"])
    except:
        raise Http404()

    if (blot not in member.blots.all()):
        raise Http404()

    # Create a dictionary for the data
    data = {}

    member_friends = list(member.friends.all())
    member_friends.sort(key = lambda m : m.last_name)

    # Get the name and number of mutual friends for each of the logged in member's friends
    friends = []
    for m in member_friends:
        m.num_mutual_friends = member.get_num_mutual_friends(m)
        html = render_to_string( "s_memberListItem.html", {
            "m" : m,
            "include_delete_items" : False,
            "include_selection_item" : True,
            "blot" : blot
        })
        
        friends.append({
            "id" : m.id,
            "lastName" : m.last_name,
            "html": html
        })
    
    # Sort and add the friends list to the data dictionary
    data["friends"] = friends

    # Create and return a JSON object
    response = simplejson.dumps(data)
    return HttpResponse(response, mimetype = "application/json")


@csrf_exempt
def s_add_to_blot_view(request):
    """Adds a member to a blot."""
    # Get the logged in member
    member = Member.active.get(pk = request.session["member_id"])

    try:
        blot = Blot.objects.get(pk = request.POST["blotId"])
        m = Member.objects.get(pk = request.POST["memberId"])
    except:
        raise Http404()

    if (blot not in member.blots.all()):
        raise Http404()

    blot.members.add(m)
    
    return HttpResponse()


@csrf_exempt
def s_remove_from_blot_view(request):
    """Removes a member from a blot."""
    # Get the logged in member
    member = Member.active.get(pk = request.session["member_id"])

    try:
        blot = Blot.objects.get(pk = request.POST["blotId"])
        m = Member.objects.get(pk = request.POST["memberId"])
    except:
        raise Http404()

    if (blot not in member.blots.all()):
        raise Http404()

    try:
        blot.members.remove(m)
    except:
        raise Http404()
    
    return HttpResponse()


@csrf_exempt
def s_create_blot_view(request):
    """Creates a new blot and adds it to the logged in member's blots."""
    # Get the logged in member
    member = Member.active.get(pk = request.session["member_id"])

    blot = Blot(name = "")
    blot.save()

    member.blots.add(blot)
    
    return HttpResponse(blot.id)


@csrf_exempt
def s_rename_blot_view(request):
    """Renames a blot."""
    # Get the logged in member
    member = Member.active.get(pk = request.session["member_id"])

    try:
        blot = Blot.objects.get(pk = request.POST["blotId"])
        name = request.POST["name"]
    except:
        raise Http404()

    blot.name = name
    blot.save()
    
    return HttpResponse(blot.id)
