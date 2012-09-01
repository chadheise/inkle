# TODO: remove unnecessary imports
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

#Modules needed specifically for mobile views
# TODO: possible get rid of these since these were used by chad and julie and may not be applicable any more
from django.views.decorators.csrf import csrf_exempt
from django.core import serializers
from xml.dom.minidom import parse, parseString
import os
import sys
from views import *

# TODO: remove csrf_exempt?
@csrf_exempt
def s_is_logged_in(request):
    """Returns True if a user is logged in or false otherwise."""
    return HttpResponse("member_id" in request.session)


# TODO: clean up?
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
            if (member and member.is_active and (member.check_password(data["password"]))):
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


# TODO: remove csrf_exempt?
@csrf_exempt
def s_logout_view(request):
    """Logs out the logged-in member."""
    try:
        del request.session["member_id"]
    except KeyError:
        pass

    return HttpResponse()


@csrf_exempt
def s_all_inklings_view(request):
    """Returns a list of inklings which the logged-in member's friends are attending."""
    # Get the logged-in member
    try:
        member = Member.active.get(pk = request.session["member_id"])
    except (Member.DoesNotExist, KeyError) as e:
        raise Http404()

    # Get a list of the members who are in the groups selected by the logged-in member
    if ("selectedGroupIds" in request.POST):
        members = []
        for group_id in request.POST["selectedGroupIds"].split(",")[:-1]:
            group = Group.objects.get(pk = group_id)
            if (group.creator == member):
                for m in group.members.all():
                    if (m not in members):
                        members.append(m)

    # Otherwise, if no groups are selected, get all of the logged-in members's friends
    else:
        members = member.friends.all()    # TODO: filter for active members?

    # Get the date, or set it to today if no date is specified
    # TODO: catch errors for "month" and "year"
    if ("day" in request.POST):
        day = int(request.POST["day"])
        month = int(request.POST["month"])
        year = int(request.POST["year"])
        date = datetime.date(year, month, day)
    else:
        date = datetime.date.today()

    # Get a list of all the inklings the members are attending on the specified date
    response_inklings = []
    inklings = []
    for m in members:
        for i in m.inklings.filter(date = date):
            if i not in inklings:
                html = render_to_string( "s_inklingListItem.html", {
                    "i" : i
                })
                response_inklings.append({
                    "id" : i.id,
                    "html" : html,
                    "numAttendees" : i.get_num_attendees()
                })
                inklings.append(i)

    # Sort the inklings according to their number of attendees
    response_inklings.sort(key = lambda i : i["numAttendees"], reverse = True)

    # Create and return a JSON object
    response = simplejson.dumps(response_inklings)
    return HttpResponse(response, mimetype = "application/json")


@csrf_exempt
def s_all_inklings_groups_view(request):
    """Returns a list of the logged-in member's groups (with selected selection buttons)."""
    # Get the logged-in member
    try:
        member = Member.active.get(pk = request.session["member_id"])
    except (Member.DoesNotExist, KeyError) as e:
        raise Http404()
    
    # Get an alphabetical list of the logged-in member's groups
    groups = list(member.group_set.all())
    groups.sort(key = lambda g : g.name)

    # Get the HTML for the logged-in member's group list items
    response_groups = []
    for g in groups:
        g.selected = True
        html = render_to_string( "s_groupInviteeListItem.html", {
            "b" : g,   # TODO: switch from b to g in template
            "idPrefix" : "allInklings"
        })
        response_groups.append({
            "id" : g.id,
            "html" : html
        })

    # Create and return a JSON object
    response = simplejson.dumps(response_groups)
    return HttpResponse(response, mimetype = "application/json")


@csrf_exempt
def s_is_member_inkling_view(request):
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
def s_inkling_view(request):
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

    # Return the HTML for the current inkling
    return render_to_response( "s_inkling.html",
        { "member" : member, "inkling" : inkling },
        context_instance = RequestContext(request) )


# TODO: possible get rid of this
@csrf_exempt
def s_edit_inkling_view(request):
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
    return render_to_response( "s_editInkling.html",
        { "member" : member, "inkling" : inkling },
        context_instance = RequestContext(request) )


@csrf_exempt
def s_save_inkling_view(request):
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
        category = request.POST["category"]   # TODO: get rid of category
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
    return render_to_response( "s_inkling.html",
        { "member" : member, "inkling" : inkling },
        context_instance = RequestContext(request) )


@csrf_exempt
def s_join_inkling_view(request):
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
def s_inkling_feed_view(request):
    """Returns the feed for an inkling."""  # TODO: update comment
    # Get the logged-in member
    # TODO: get rid of 'member' retrieval if possible?
    try:
        member = Member.active.get(pk = request.session["member_id"])
    except (Member.DoesNotExist, KeyError) as e:
        raise Http404()

    # Get the current inkling
    try:
        inkling = Inkling.objects.get(pk = request.POST["inklingId"])
    except:
        raise Http404()

    # Get a list of all the feed items (comments and updates)
    feed_items = []
    for comment in inkling.feedcomment_set.all():
        feed_items.append((comment, "comment"))
    for update in inkling.feedupdate_set.all():
        feed_items.append((update, "event"))

    # Sort the feed items chronologically
    feed_items.sort(key = lambda i : i[0].date_created)

    # Return the HTML for the current inkling's feed
    return render_to_response( "s_inklingFeed.html",
        { "member" : member, "inkling" : inkling, "feedItems" : feed_items },
        context_instance = RequestContext(request) )


# TODO: rename to add_comment_view
@csrf_exempt
def s_post_new_comment_view(request):
    """Adds a new comment to the inputted inkling's feed."""
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

    # Get the new comment's text
    try:
        text = request.POST["text"]
    except:
        raise Http404()

    # Create the new comment
    FeedComment.objects.create(creator = member, inkling = inkling, text = text)

    # TODO: get rid of the rest of this function

    # Get a list of all the feed items (comments and updates)
    feed_items = []
    for comment in inkling.feedcomment_set.all():
        feed_items.append((comment, "comment"))
    for update in inkling.feedupdate_set.all():
        feed_items.append((update, "event"))

    # Sort the feed items chronologically
    feed_items.sort(key = lambda i : i[0].date_created)

    # Return the HTML for the current inkling's feed
    return render_to_response( "s_inklingFeed.html",
        { "member" : member, "inkling" : inkling, "feedItems" : feed_items },
        context_instance = RequestContext(request) )


# TODO: remove csrf_exempt?
@csrf_exempt
def s_my_inklings_view(request):
    """Returns the HTML for the logged-in member's inklings."""  # TODO: update comment
    # Get the logged-in member
    try:
        member = Member.active.get(pk = request.session["member_id"])
    except (Member.DoesNotExist, KeyError) as e:
        raise Http404()

    # Create several date objects
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


# TODO: remove csrf_exempt?
@csrf_exempt
def s_num_inkling_invites_view(request):
    """Returns the number of inklings to which the logged-in member has pending invitations."""
    # Get the logged-in member
    try:
        member = Member.active.get(pk = request.session["member_id"])
    except (Member.DoesNotExist, KeyError) as e:
        raise Http404()
    
    # Return the number of inklings to which the logged-in member has pending invitations
    return HttpResponse(member.inkling_invitations_received.filter(status = "pending").count())


# TODO: remove csrf_exempt?
@csrf_exempt
def s_inkling_invites_view(request):
    """Returns a list of the inklings to which the logged-in member has pending invitations."""
    # Get the logged-in member
    try:
        member = Member.active.get(pk = request.session["member_id"])
    except (Member.DoesNotExist, KeyError) as e:
        raise Http404()
    
    # Get a list of the inklings to which the logged-in member has pending invitations
    response_invites = []
    for i in member.inkling_invitations_received.filter(status = "pending"):
        html = render_to_string( "s_inklingInviteListItem.html", {
            "inkling" : i
        })
        
        response_invites.append({
            "id" : i.id,
            "html": html
        })
    
    # Create and return a JSON object
    response = simplejson.dumps(response_invites)
    return HttpResponse(response, mimetype = "application/json")


# TODO: I think this can now be removed since invitations have been modeled differently
@csrf_exempt
def s_create_inkling_view(request):
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
def s_update_inkling_view(request):
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
def s_num_invited_friends_view(request):
    """Returns the number of friends who have been invited to the inputted inkling."""
    # Get the current inkling
    try:
        inkling = Inkling.objects.get(pk = request.POST["inklingId"])
    except:
        raise Http404()

    num_invited_friends = inkling.invited_friends.count()
    
    return HttpResponse(num_invited_friends)


@csrf_exempt
def s_inkling_invited_friends_view(request):
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
    friends.sort(key = lambda m : m.last_name)  # TODO: I don't think I need to sort this as the sencha sorter will handle it

    # Get a list of the logged-in member's friends
    response_friends = []
    for m in friends:
        m.selected = inkling.member_has_pending_invitation(m)

        html = render_to_string( "s_friendInviteeListItem.html", {
            "m" : m,
            "idPrefix" : "invite"
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
def s_inkling_invited_groups_view(request):
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

        html = render_to_string( "s_groupInviteeListItem.html", {
            "b" : g,  # TODO: change b to g in template
            "idPrefix" : "invite"
        })

        response_groups.append({
            "id" : g.id,
            "html" : html
        })

    # Create and return a JSON object
    response = simplejson.dumps(response_groups)
    return HttpResponse(response, mimetype = "application/json")


@csrf_exempt
def s_invite_group_view(request):
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
def s_uninvite_group_view(request):
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
def s_invite_member_view(request):
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
def s_uninvite_member_view(request):
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
def s_friends_view(request):
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
    friends.sort(key = lambda m : m.last_name) # TODO: I don't think I need this

    # Get the HTML for each of the logged-in member's friends
    response_friends = []
    for m in friends:
        m.num_mutual_friends = member.get_num_mutual_friends(m)
        
        html = render_to_string( "s_memberListItem.html", {
            "m" : m,
            "include_delete_items" : mode == "friends", # TODO: get rid of this
            "include_selection_item" : mode == "invite" # TODO: get rid of this
        })
        
        response_friends.append({
            "id" : m.id,
            "lastName" : m.last_name,
            "html": html
        })
    
    # Create and return a JSON object
    response = simplejson.dumps(response_friends)
    return HttpResponse(response, mimetype = "application/json")


# TODO: get rid of this possibly?
# TODO: update all of this function's comments
@csrf_exempt
def s_groups_view(request):
    """Returns a list of the logged-in member's groups."""
    # Get the logged-in member
    try:
        member = Member.active.get(pk = request.session["member_id"])
    except (Member.DoesNotExist, KeyError) as e:
        raise Http404()

    # Get the POST data
    try:
        include_all_groups_group = request.POST["includeAllGroupsGroup"]
        invitees_mode = request.POST["inviteesMode"]
    except:
        raise Http404()

    # Get the name and number of member for each of the logged in member's groups
    response_groups = []

    if (include_all_groups_group == "true"):
        response_groups.append({
            "text" : "All Groups",
            "value" : -1,
        })
    elif (invitees_mode == "true"):
        html = render_to_string( "s_groupInviteeListItem.html", {
            "allFriendsItem" : True,
            "idPrefix" : "groups"
        })
        response_groups.append({
            "id" : -1,
            "html" : html
        })

    # Sort the member's group alphabetically
    groups = list(member.group_set.all())
    groups.sort(key = lambda b : b.name)
    
    for b in groups:
        if (include_all_groups_group == "true"):
            response_groups.append({
                "text" : b.name,
                "value" : b.id
            })
        elif (invitees_mode == "true"):
            html = render_to_string( "s_groupInviteeListItem.html", {
                "b" : b,
                "allFriendsItem" : False,
                "idPrefix" : "groups"
            })
            response_groups.append({
                "id" : b.id,
                "html" : html
            })
        else:
            html = render_to_string( "s_groupListItem.html", {
                "b" : b,
            })
            response_groups.append({
                "id" : b.id,
                "html" : html
            })

    # Create and return a JSON object
    response = simplejson.dumps(response_groups)
    return HttpResponse(response, mimetype = "application/json")


@csrf_exempt
def s_friend_requests_view(request):
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
        
        html = render_to_string( "s_friendRequestListItem.html", {
            "m" : m
        })
        
        response_friend_requests.append({
            "id" : m.id,
            "html": html
        })
    
    # Create and return a JSON object
    response = simplejson.dumps(response_friend_requests)
    return HttpResponse(response, mimetype = "application/json")


@csrf_exempt
def s_num_friend_requests_view(request):
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
def s_profile_view(request):
    """Returns the HTML for the profile page."""
    # Get the logged-in member
    try:
        member = Member.active.get(pk = request.session["member_id"])
    except (Member.DoesNotExist, KeyError) as e:
        raise Http404()

    # Return the HTML for the profile page
    return render_to_response( "s_profile.html",
        { "member" : member },
        context_instance = RequestContext(request) )


@csrf_exempt
def s_people_search_view(request):
    """Returns a list of member's who match the inputted query."""
    # Get the logged-in member
    try:
        member = Member.active.get(pk = request.session["member_id"])
    except (Member.DoesNotExist, KeyError) as e:
        raise Http404()

    # Get the search query
    try:
        query = request.POST["query"]
    except:
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

    # Sort the members by last name
    members = list(members)
    members.sort(key = lambda m : m.last_name)

    # Get the HTML for each member's list item
    response_members = []
    for m in members:
        m.num_mutual_friends = member.get_num_mutual_friends(m)
        
        m.is_friend = m in member.friends.all()
        
        html = render_to_string( "s_memberListItem.html", {
            "m" : m,
            "member" : member,
            "include_add_friend_buttons" : True,
            "include_delete_items" : False,
            "include_selection_item" : False
        })
        
        response_members.append({
            "id" : m.id,
            "html": html
        })

    # Create and return a JSON object
    response = simplejson.dumps(response_members)
    return HttpResponse(response, mimetype = "application/json")


# TODO: rename as send_friend_request_view
@csrf_exempt
def s_add_friend_view(request):
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
def s_respond_to_request_view(request):
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

    # TODO: get rid of this return value if possible
    return HttpResponse(FriendRequest.objects.filter(receiver = member, status = "pending").count())


@csrf_exempt
def s_remove_friend_view(request):
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
def s_delete_group_view(request):
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
def s_group_members_view(request):
    """Returns a list of the logged-in member's friends and if they are in the inputted group."""
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

    # Get a list of the logged-in members friends
    friends = list(member.friends.all())
    friends.sort(key = lambda m : m.last_name) # TODO: try to remove this and just use a sencha sorter

    # Get the HTML for each of the logged-in member's friends' list item (and whether or not they are in the inputted group)
    response_friends = []
    for m in friends:
        m.num_mutual_friends = member.get_num_mutual_friends(m)
        
        html = render_to_string( "s_memberListItem.html", {
            "m" : m,
            "include_delete_items" : False, # TODO: remove this?
            "include_selection_item" : True, # TODO: remove this?
            "group" : group
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
def s_add_to_group_view(request):
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
def s_remove_from_group_view(request):
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
def s_create_group_view(request):
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
def s_rename_group_view(request):
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
