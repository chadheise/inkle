from django.template import RequestContext
from django.http import HttpResponse, HttpResponseRedirect, Http404

from django.shortcuts import render_to_response

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
    inklings.append(["This Week", member.inklings.filter(date__gt = today).filter(date__lte = this_week)])
    inklings.append(["Future", member.inklings.filter(date__gte = this_week)])

    return render_to_response( "s_myInklings.html",
        { "inklings" : inklings },
        context_instance = RequestContext(request) )


@csrf_exempt
def s_friends_view(request):
    """Returns the."""

    # Get the logged in member
    member = Member.active.get(pk = request.session["member_id"])

    # Create a dictionary for the data
    data = {}

    # Get the name and number of mutual friends for each of the logged in member's friends
    friends = []
    for m in member.friends.all():
        friends.append({
            "id" : m.id,
            "firstName" : m.first_name,
            "lastName" : m.last_name,
            "numMutualFriends" : member.get_num_mutual_friends(m) }
        )
    
    # Sort and add the friends list to the data dictionary
    friends.sort(key = lambda m : m["lastName"])
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

    for b in member.blots.all():
        if (include_all_blots_blot == "true"):
            blots.append({
                "text" : b.name,
                "value" : b.id
            })
        else:
            blots.append({
                "id" : b.id,
                "name" : b.name,
                "numMembers" : b.members.count()
            })

    # Sort and add the blots list to the data dictionary
    if (include_all_blots_blot == "false"):
        blots.sort(key = lambda b : b["name"])
    data["blots"] = blots

    # Create and return a JSON object
    response = simplejson.dumps(data)
    return HttpResponse(response, mimetype = "application/json")


@csrf_exempt
def s_sharing_view(request):
    """Returns the HTML for the friends view sharing content."""

    # Get the logged in member
    member = Member.active.get(pk = request.session["member_id"])

    return render_to_response( "s_sharing.html",
        { "member" : member },
        context_instance = RequestContext(request) )


@csrf_exempt
def s_profile_view(request):
    """Returns the HTML for the logged in user's profile."""

    # Get the logged in member
    member = Member.active.get(pk = request.session["member_id"])

    return render_to_response( "s_profile.html",
        { "member" : member },
        context_instance = RequestContext(request) )
