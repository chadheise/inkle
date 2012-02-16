from django.template import RequestContext
from django.http import HttpResponse, HttpResponseRedirect, Http404

from django.shortcuts import render_to_response

from django.contrib.auth.models import User
from django.contrib import auth

from myproject.inkle.models import *
from myproject.inkle.emails import *

import datetime
import shutil
import re

from myproject.settings import MEDIA_ROOT

buttonDictionary = {
    "request" : ("requestToFollow", "Request to follow", "Send a request to start following this person"),
    "prevent" : ("preventFollowing", "Block", "No longer allow this person to follow me"),
    "revoke" : ("revokeRequest", "Revoke request", "Revoke my request to follow this person"),
    "stop" : ("stopFollowing", "Stop following", "Stop following this person"),
    "blots" : ("blotsCardButton", "Blots"),
    "reject" : ("rejectRequest", "Reject request", "Do not allow this person to follow me"),
    "accept" : ("acceptRequest", "Accept request", "Allow this person to follow me"),
    "join" : ("joinNetwork", "Join network", "Beome a member of this network"),
    "leave" : ("leaveNetwork", "Leave network", "I no longer wish to be a part of this network"),
}


def is_email(email):
    """Returns True if the inputted email is a valid email address format; otherwise, returns False."""
    if (re.search(r"[a-zA-Z0-9+_\-\.]+@[0-9a-zA-Z][\.-0-9a-zA-Z]*\.[a-zA-Z]+", email)):
        return True
    else:
        return False

def date_selected_view(request):
    """Updates the calendar once a date is clicked."""
    # Get the member who is logged in (or redirect them to the login page)
    try:
        member = Member.active.get(pk = request.session["member_id"])
    except (Member.DoesNotExist, KeyError) as e:
        return HttpResponseRedirect("/login/")
    
    if request.POST["arrow"] == "today":
        date1 = datetime.date.today()
        selectedDate = date1
    elif request.POST["arrow"] == "left":
        date1 = datetime.date(int(request.POST["firstYear"]), int(request.POST["firstMonth"]), int(request.POST["firstDay"])) - datetime.timedelta(days = 1)
        selectedDate = datetime.date(int(request.POST["selectedYear"]), int(request.POST["selectedMonth"]), int(request.POST["selectedDay"]))
    elif request.POST["arrow"] == "right":
        date1 = datetime.date(int(request.POST["firstYear"]), int(request.POST["firstMonth"]), int(request.POST["firstDay"])) + datetime.timedelta(days = 1)
        selectedDate = datetime.date(int(request.POST["selectedYear"]), int(request.POST["selectedMonth"]), int(request.POST["selectedDay"]))
    
    dates = [date1 + datetime.timedelta(days = x) for x in range(int(request.POST["numDates"]))]
    
    return render_to_response( "calendar.html",
        {"dates" : dates, "selectedDate" : selectedDate },
        context_instance = RequestContext(request) )

def get_location_inklings_view(request):
    # Get the member who is logged in (or redirect them to the login page)
    try:
        member = Member.active.get(pk = request.session["member_id"])
    except:
        if (request.POST["location_id"]):
            return HttpResponseRedirect("/login/?next=/location/" + request.POST["location_id"] + "/")
        else:
            return HttpResponseRedirect("/login/")

    # Get date objects
    date1 = datetime.date(int(request.POST["year"]), int(request.POST["month"]), int(request.POST["day"]))
    dates = [date1 + datetime.timedelta(days = x) for x in range(4)]

    member = get_location_inklings(request.session["member_id"], request.POST["location_id"], None, date1)
    
    return render_to_response( "locationInklings.html",
        { "member" : member},
        context_instance = RequestContext(request) )

def get_member_place_view(request):
    # Get the member who is logged in (or redirect them to the login page)
    try:
        member = Member.active.get(pk = request.session["member_id"])
    except:
        if (request.POST["other_member_id"]):
            return HttpResponseRedirect("/login/?next=/member/" + request.session["member_id"] + "/" + request.POST["other_member_id"] + "/")
        else:
            return HttpResponseRedirect("/login/")

    # Get the member whose page is being viewed (or throw a 404 error if their member ID is invalid)
    try:
        other_member = Member.active.get(pk = request.POST["other_member_id"])
        # Determine the privacy rating for the logged in member and the current member whose page is being viewed
        other_member.privacy = get_privacy(member, other_member)

        if (other_member.privacy < other_member.place_privacy):
            return render_to_response( "noPermission.html",
                {},
                context_instance = RequestContext(request) )
    except:
        pass

    # Get date objects
    date1 = datetime.date(int(request.POST["date"].split("/")[2]), int(request.POST["date"].split("/")[0]), int(request.POST["date"].split("/")[1]))
    dates = [date1 + datetime.timedelta(days = x) for x in range(4)]

    if ("other_member_id" in request.POST):
        member = get_location_inklings(member.id, None, request.POST["other_member_id"], date1)
    else:
        member = get_location_inklings(member.id, None, member.id, date1)

    return render_to_response( "locationInklings.html",
        { "member" : member},
        context_instance = RequestContext(request) )

def get_location_inklings(member_id = None, location_id = None, member_place_id = None, date = datetime.date.today()):
    """Returns a member object with additional fields indicating inklings at the input location for the input datetime date object"""
    # Get the member who is logged in (or redirect them to the login page)
    try:
        member = Member.active.get(pk = member_id)
    except:
        if (location_id):
            return HttpResponseRedirect("/login/?next=/location/" + location_id + "/")
        elif (member_place_id):
            return HttpResponseRedirect("/login/?next=/member/" + member_place_id + "/place/")
        else:
            return HttpResponseRedirect("/login/")
    # Get the location or member_place corresponding to the inputted ID (or throw a 404 error if it is invalid)
    try:
        if (location_id):
            location = Location.objects.get(pk = int(location_id))
            # Get all of the specified date's inklings at the provided location
            location_inklings = Inkling.objects.filter(date = date, location = location)
        else:
            member_place = Member.active.get(pk = int(member_place_id))
            # Get all of the specified date's inklings at the provided location
            location_inklings = Inkling.objects.filter(date = date, member_place = member_place)
    except:
        raise Http404()
    
    # Get the people whom the logged in member is following
    following = member.following.filter(is_active = True)

    # Get the logged in member's dinner inkling and the members who are attending
    try:
        dinner_inkling = location_inklings.get(category = "dinner")
        all_dinner_members = dinner_inkling.member_set.all()
        member.dinner_members = [m for m in all_dinner_members if (m in following or m == member or m.inklings_privacy == 0)]
        member.num_dinner_others = len(all_dinner_members) - len(member.dinner_members)
        for m in member.dinner_members:
            m.show_contact_info = True
            m.mutual_followings = member.following.filter(is_active = True) & m.following.filter(is_active = True)
            if m in following:
                m.button_list = [buttonDictionary["blots"]]
            # Determine the privacy rating for the logged in member and the current member
            m.privacy = get_privacy(member, m)
    except Inkling.DoesNotExist:
        member.dinner_members = []
        member.num_dinner_others = 0

    # Get the logged in member's pregame inkling and the members who are attending
    try:
        pregame_inkling = location_inklings.get(category = "pregame")
        all_pregame_members = pregame_inkling.member_set.all()
        member.pregame_members = [m for m in all_pregame_members if (m in following or m == member or m.inklings_privacy == 0)]
        member.num_pregame_others = len(all_pregame_members) - len(member.pregame_members)
        for m in member.pregame_members:
            m.show_contact_info = True
            m.mutual_followings = member.following.filter(is_active = True) & m.following.filter(is_active = True)
            if m in following:
                m.button_list = [buttonDictionary["blots"]]
            # Determine the privacy rating for the logged in member and the current member
            m.privacy = get_privacy(member, m)
    except Inkling.DoesNotExist:
        member.pregame_members = []
        member.num_pregame_others = 0

    # Get the logged in member's main event inkling and the members who are attending
    try:
        main_event_inkling = location_inklings.get(category = "mainEvent")
        all_main_event_members = main_event_inkling.member_set.all()
        member.main_event_members = [m for m in all_main_event_members if (m in following or m == member or m.inklings_privacy == 0)]
        member.num_main_event_others = len(all_main_event_members) - len(member.main_event_members)
        for m in member.main_event_members:
            m.show_contact_info = True
            m.mutual_followings = member.following.filter(is_active = True) & m.following.filter(is_active = True)
            if m in following:
                m.button_list = [buttonDictionary["blots"]]
            # Determine the privacy rating for the logged in member and the current member
            m.privacy = get_privacy(member, m)
    except Inkling.DoesNotExist:
        member.main_event_members = []
        member.num_main_event_others = 0
        
    return member 


def get_privacy(member, other_member):
    # Determine the privacy rating for the logged in member and the current member whose page is being viewed
    if ((member == other_member) or (member in other_member.followers.all())):
        return 2
    elif (member in other_member.following.all()):
        return 1
    else:
        return 0

def edit_location_view(request):
    """Edits a location's Location object."""
    # Get the member who is logged in (or raise a 404 error if the member ID is invalid)
    try:
        member = Member.active.get(pk = request.session["member_id"])
    except:
        raise Http404()

    # Make sure the logged in member can update the location
    if (not member.is_staff):
        raise Http404()
    
    # Get the location (or throw a 404 error if the location ID is invalid)
    try:
        location = Location.objects.get(pk = request.POST["locationID"])
    except:
        raise Http404()
   
    try:
        # Update the location's information using the POST data
        location.name = request.POST["name"]
        location.street = request.POST["street"]
        location.city = request.POST["city"]
        location.state = request.POST["state"]
        location.zip_code = int(request.POST["zipCode"])
        location.phone = request.POST["phone"]
        location.category = request.POST["category"]
        location.website = request.POST["website"]
        location.image = request.POST["image"]

        # Make sure the location begins with "http://www."
        if (location.website):
            if ((not location.website.startswith("http://")) and (not location.website.startswith("www"))):
                location.website = "http://www." + location.website
            elif (not location.website.startswith("http://")):
                location.website = "http://" + location.website
    
        # Save the location's updated information
        location.save()

    except KeyError:
        pass

    return render_to_response( "locationInfo.html",
        {"member" : member, "location" : location},
        context_instance = RequestContext(request) )


def inkling_invitations_view(request):
    # Get the logged in member (or raise a 404 error if the member ID is invalid)
    try:
        member = Member.active.get(pk = request.session["member_id"])
    except:
        raise Http404()

    invites = request.POST["invited"].split("|<|>|")
    members = []
    i = 0
    while (i < len(invites)):
        if (invites[i] == "people"):
            try:
                m = Member.active.get(pk = int(invites[i + 1]))
                if (((m in member.following.filter(is_active = True)) or (m in member.followers.filter(is_active = True))) and (m not in members)):
                    members.append(m)
            except:
                pass
        elif (invites[i] == "blots"):
            try:
                blot = Blot.objects.get(pk = int(invites[i + 1]))
                if (blot in member.blots.all()):
                    for m in blot.members.filter(is_active = True):
                        if (m not in members):
                            members.append(m)
            except:
                pass
        i += 1

    try:
        inkling = Inkling.objects.get(pk = request.POST["inklingID"])
        invitation = Invitation(description = "", inkling = inkling, from_member = member)
        invitation.save()
        for m in members:
            if (not m.invitations.filter(inkling = inkling, from_member = member)):
                m.invitations.add(invitation)
                if (m.invited_email_preference and m.verified):
                    send_inkling_invitation_email(member, m, inkling)
    except:
        pass

    return HttpResponse()


def request_to_follow_view(request):
    """Sends a request from the from_member to follow the to_member."""
    # Get the member who sent the request (or raise a 404 error if the member ID is invalid)
    try:
        from_member = Member.active.get(pk = request.session["member_id"])
    except:
        raise Http404()

    # Get the member to whom the request is being sent (or raise a 404 error if the member ID is invalid)
    try:
        to_member = Member.active.get(pk = request.POST["toMemberID"])
    except:
        raise Http404()

    # Update the database to signify the request
    from_member.pending.add(to_member)
    to_member.requested.add(from_member)

    # Return the updated tooltip
    return HttpResponse(buttonDictionary["revoke"][2])


def revoke_request_view(request):
    """Revokes the request from the from_member to follow the to_member."""
    # Get the member who sent the request (or raise a 404 error if the member ID is invalid)
    try:
        from_member = Member.active.get(pk = request.session["member_id"])
    except:
        raise Http404()

    # Get the member to whom the request is being sent (or raise a 404 error if the member ID is invalid)
    try:
        to_member = Member.active.get(pk = request.POST["toMemberID"])
    except:
        raise Http404()

    # Update the database to signify the revoking of the request
    from_member.pending.remove(to_member)
    to_member.requested.remove(from_member)

    return HttpResponse(buttonDictionary["request"][2])


def accept_request_view(request):
    """Accepts the request from the from_member to follow the to_member."""
    # Get the member to whom the request is being sent (or raise a 404 error if the member ID is invalid)
    try:
        to_member = Member.active.get(pk = request.session["member_id"])
    except:
        raise Http404()

    # Get the member who sent the request (or raise a 404 error if the member ID is invalid)
    try:
        from_member = Member.active.get(pk = request.POST["fromMemberID"])
    except:
        raise Http404()

    # Update the database to signify the accepted request
    from_member.pending.remove(to_member)
    to_member.requested.remove(from_member)
    to_member.followers.add(from_member)
    from_member.following.add(to_member)
    from_member.accepted.add(to_member)
    
    return render_to_response( "requestConfirmation.html",
        { "member" : from_member, "acceptedOrRejected" : "accepted" },
        context_instance = RequestContext(request) )


def reject_request_view(request):
    """Rejects the request from the from_member to follow the to_member."""
    # Get the member to whom the request is being sent (or raise a 404 error if the member ID is invalid)
    try:
        to_member = Member.active.get(pk = request.session["member_id"])
    except:
        raise Http404()

    # Get the member who sent the request (or raise a 404 error if the member ID is invalid)
    try:
        from_member = Member.active.get(pk = request.POST["fromMemberID"])
    except:
        raise Http404()

    # Update the database to signify the request
    from_member.pending.remove(to_member)
    to_member.requested.remove(from_member)

    return render_to_response( "requestConfirmation.html",
        { "member" : from_member, "acceptedOrRejected" : "rejected" },
        context_instance = RequestContext(request) )


def stop_following_view(request):
    """Makes the from_member stop following the to_member."""
    # Get the member who sent the request (or raise a 404 error if the member ID is invalid)
    try:
        from_member = Member.active.get(pk = request.session["member_id"])
    except:
        raise Http404()

    # Get the member to whom the request was sent (or raise a 404 error if the member ID is invalid)
    try:
        to_member = Member.active.get(pk = request.POST["toMemberID"])
    except:
        raise Http404()

    # Make the from_member stop following the to_member
    remove_following(from_member, to_member)

    return HttpResponse()


def prevent_following_view(request):
    """Makes the from_member stop following the to_member."""
    # Get the member to whom the request was sent (or raise a 404 error if the member ID is invalid)
    try:
        to_member = Member.active.get(pk = request.session["member_id"])
    except:
        raise Http404()

    # Get the member who sent the request (or raise a 404 error if the member ID is invalid)
    try:
        from_member = Member.active.get(pk = request.POST["fromMemberID"])
    except:
        raise Http404()

    # Make the from_member stop following the to_member
    remove_following(from_member, to_member)

    return render_to_response( "preventFollowingConfirmation.html",
        { "member" : from_member },
        context_instance = RequestContext(request) )


def remove_following(from_member, to_member):
    """Makes the from_member stop following the to_member."""
    # Remove the to_member from the from_member's accepted list
    from_member.accepted.remove(to_member)

    # Remove the to_member from all of the from_member's blots
    for blot in from_member.blots.all():
        blot.members.remove(to_member)

    # Remove the from_member follower of to_member
    to_member.followers.remove(from_member)
    
    # Remove to_member from from_member's following list
    from_member.following.remove(to_member)

    return


def invitation_response_view(request):
    """Responds to the current invitation."""
    # Get the member who is logged in (or raise a 404 error if the member ID is invalid)
    try:
        member = Member.active.get(pk = request.session["member_id"])
    except:
        raise Http404()

    # Get the invitation which is being responded to (or raise a 404 error if the invitation ID is invalid)
    try:
        invitation = member.invitations.get(pk = request.POST["invitationID"])
        response = request.POST["response"]
    except:
        raise Http404()

    # Make sure the invitation is actually in the logged in member's invitation list
    if (invitation not in member.invitations.all()):
        raise Http404()

    # Update the logged in member's inkling if they accepted the current invitation
    if (response == "accept"):
        # See if the logged in member already has an inkling for the location/date combination
        try:
            conflicting_inkling = member.inklings.get(category = invitation.inkling.category, date = invitation.inkling.date)
            if (conflicting_inkling != invitation.inkling):
                remove_inkling(member, conflicting_inkling)
        except Inkling.DoesNotExist:
            pass

        # Add the inkling to the logged in member's inklings list
        member.inklings.add(invitation.inkling)

    # Remove the invitation from the logged in member's invitations
    member.invitations.remove(invitation)

    return render_to_response( "invitationConfirmation.html",
        { "invitation" : invitation, "response" : response },
        context_instance = RequestContext(request) )


def add_to_blot_view(request):
    """Adds the to_member to one of from_member's blots."""
    # Get the member who sent the request (or raise a 404 error if the member ID is invalid)
    try:
        from_member = Member.active.get(pk = request.session["member_id"])
    except:
        raise Http404()

    # Get the member to whom the request was sent (or raise a 404 error if the member ID is invalid)
    try:
        to_member = Member.active.get(pk = request.POST["toMemberID"])
    except:
        raise Http404()

    # Get the blot to which to_member is being added (or raise a 404 error if the blot ID is invalid)
    try:
        blot = Blot.objects.get(pk = request.POST["blotID"])
    except:
        raise Http404()

    # Add the to_member to the blot
    blot.members.add(to_member)

    # If the to_member was only in the accepted list, remove them from the accepted list
    if (to_member in from_member.accepted.all()):
        from_member.accepted.remove(to_member)
    
    # Get the to_member's info for their member card
    to_member.mutual_followings = from_member.following.filter(is_active = True) & to_member.following.filter(is_active = True)
    to_member.button_list = [buttonDictionary["stop"], buttonDictionary["blots"]]
    to_member.show_contact_info = True
   
    return render_to_response( "memberCard.html",
        { "member" : from_member, "m" : to_member },
        context_instance = RequestContext(request) )


def remove_from_blot_view(request):
    """Removes the to_member from one of from_member's blots."""
    # Get the member who sent the request (or redirect them to the login page)
    try:
        from_member = Member.active.get(pk = request.session["member_id"])
    except:
        return HttpResponseRedirect("/login/")

    # Get the member to whom the request was sent (or throw a 404 error if the to member ID is invalid)
    try:
        to_member = Member.active.get(pk = request.POST["toMemberID"])
    except:
        raise Http404()
    
    # Get the blot to which to_member is being removed (or raise a 404 error if the blot ID is invalid)
    try:
        blot = Blot.objects.get(pk = request.POST["blotID"])
    except:
        raise Http404()

    # Remove the to_member from the from_member's blot
    remove_from_blot(from_member, to_member, blot)

    return HttpResponse()


def remove_from_blot(from_member, to_member, blot):
    """Removes the to_member from one of from_member's blots."""
    # Remove the to_member from the from_member's blot
    blot.members.remove(to_member)

    # Get the number of from_member's blots which to_member is in
    count = len([c for c in from_member.blots.all().select_related("members") if (to_member in c.members.filter(is_active = True))])

    # Add the to_member to the from_member's accepted list if the to_member no longer belongs to any of from_member's blots
    if (count == 0):
        from_member.accepted.add(to_member)

    return


def create_blot_view(request):
    """Create a new blot for the logged in member."""
    # Get the logged in member (or raise a 404 error if the member ID is invalid)
    try:
        member = Member.active.get(pk = request.session["member_id"])
    except:
        raise Http404()

    # Create the new blot and add it to the logged in member's blots list
    blot = Blot.objects.create(name = request.POST["blotName"])
    member.blots.add(blot)

    # Return the new blot's ID
    return HttpResponse(blot.id)


def rename_blot_view(request):
    """Updates the name of one of the logged in member's blots."""
    # Get the logged in member (or raise a 404 error if the member ID is invalid)
    try:
        member = Member.active.get(pk = request.session["member_id"])
    except:
        raise Http404()

    # Update the requested blot's name (or raise a 404 error if the blot ID is invalid)
    try:
        blot = member.blots.filter(pk = request.POST["blotID"]).update(name = request.POST["blotName"])
    except KeyError:
        raise Http404()

    return HttpResponse()


def delete_blot_view(request):
    """Deletes one of the logged in member's blots."""
    # Get the logged in member (or raise a 404 error if the member ID is invalid)
    try:
        member = Member.active.get(pk = request.session["member_id"])
    except:
        raise Http404()

    # Get the blot which is to be deleted (or raise a 404 error if the blot ID is invalid)
    try:
        blot = Blot.objects.get(pk = request.POST["blotID"])
    except:
        raise Http404()

    # Remove each member from the blot to be deleted 
    for m in blot.members.all():
        remove_from_blot(member, m, blot)

    # Remove the blot to be deleted from the logged in member's blots list
    member.blots.remove(blot)
    
    # Delete the blot
    blot.delete()

    return HttpResponse()


def join_network_view(request):
    """Makes the logged in member join a network."""
    # Get the logged in member (or raise a 404 error if the member ID is invalid)
    try:
        member = Member.active.get(pk = request.session["member_id"])
    except:
        raise Http404()

    # Get the network which is being joined (or raise a 404 error if the network ID is invalid)
    try:
        network = Network.objects.get(pk = request.POST["networkID"])
    except:
        raise Http404()

    # Add the network to the logged in member's networks list
    member.networks.add(network)
    member.privacy = 2

    return render_to_response( "memberCard.html",
        { "member" : member, "m" : member },
        context_instance = RequestContext(request) )


def leave_network_view(request):
    """Makes the logged in member leave a network."""
    # Get the logged in member (or raise a 404 error if the member ID is invalid)
    try:
        member = Member.active.get(pk = request.session["member_id"])
    except:
        raise Http404()

    # Get the network which is being left (or raise a 404 error if the network ID is invalid)
    try:
        network = Network.objects.get(pk = request.POST["networkID"])
    except:
        raise Http404()

    # Remove the network from the logged in member's networks list
    member.networks.remove(network)

    return HttpResponse(request.session["member_id"])


def create_inkling_view(request):
    """Adds an inkling to the logged in member's inklings."""
    # Get the logged in member (or raise a 404 error if the member ID is invalid)
    try:
        member = Member.active.get(pk = request.session["member_id"])
    except:
        raise Http404()

    # Get the POST data
    try:
        inkling_type = request.POST["inklingType"]
        if request.POST["locationType"] == "locations":
            location = Location.objects.get(pk = request.POST["locationID"])
        elif request.POST["locationType"] == "members":
            member_place = Member.active.get(pk = request.POST["locationID"])
            if member_place != member:
                raise Http404()
        date = request.POST["date"].split("/")
        date = datetime.date(day = int(date[1]), month = int(date[0]), year = int(date[2]))
    except KeyError:
        raise Http404()

    # Get the inkling for the location/type/date combination (or create it if no inkling exists)
    try:
        if request.POST["locationType"] == "locations":
            inkling = Inkling.objects.get(location = location, category = inkling_type, date = date)
        elif request.POST["locationType"] == "members":
            inkling = Inkling.objects.get(member_place = member_place, category = inkling_type, date = date)
    except Inkling.DoesNotExist:
        if request.POST["locationType"] == "locations":
            inkling = Inkling(location = location, category = inkling_type, date = date)
            inkling.save()
        elif request.POST["locationType"] == "members":
            inkling =  inkling = Inkling(member_place = member_place, category = inkling_type, date = date)
            inkling.save()
        
    # See if the logged in member already has an inkling for the location/date combination
    try:
        conflicting_inkling = member.inklings.get(category = inkling_type, date = date)
        if (conflicting_inkling != inkling):
            remove_inkling(member, conflicting_inkling)
    except Inkling.DoesNotExist:
        pass

    # Add the inkling to the logged in member's inklings list
    member.inklings.add(inkling)

    # Return the location's name and image
    if request.POST["locationType"] == "locations":
        return HttpResponse(location.name + "|<|>|" + str(location.id) + "|<|>|" + str(inkling.id))
    elif request.POST["locationType"] == "members":
        return HttpResponse(member_place.first_name + " " + member_place.last_name + "'s Place|<|>|" + str(member_place.id) + "|<|>|" + str(inkling.id))
    


def remove_inkling_view(request):
    """Removes an inkling from the logged in member's inklings."""
    # Get the logged in member (or raise a 404 error if the member ID is invalid)
    try:
        member = Member.active.get(pk = request.session["member_id"])
    except:
        raise Http404()
    
    # Get the POST data
    inkling_type = request.POST["inklingType"]
    date = request.POST["date"].split("/")
    date = datetime.date(day = int(date[1]), month = int(date[0]), year = int(date[2]))
    
    # Get the inkling for the member/type/date combination and remove it if possible
    try:
        inkling = member.inklings.get(category = inkling_type, date = date)
        remove_inkling(member, inkling)
    except Inkling.DoesNotExist:
        pass

    return HttpResponse()


def remove_inkling(member, inkling):
    """Removes and inkling from the member's inklings."""
    # Remove the inkling from the member's inkling list
    member.inklings.remove(inkling)

    # If the inkling no longer has any attendees, delete it
    if ((not inkling.member_set.all()) and (not inkling.invitation_set.all())):
        inkling.delete()

    return


def get_my_inklings_view(request):
    """Returns the logged in member's inklings for the inputted date."""
    # Get the logged in member (or raise a 404 error if the member ID is invalid)
    try:
        member = Member.active.get(pk = request.session["member_id"])
    except:
        raise Http404()

    # Get the POST data
    try:
        date = request.POST["date"].split("/")
        date = datetime.date(day = int(date[1]), month = int(date[0]), year = int(date[2]))
        include_calendar = request.POST["includeCalendar"]
    except KeyError:
        raise Http404()

    pastDate = False
    if (date < datetime.date.today()):
        pastDate = True

    # Get the names and images for the logged in member's inkling locations
    member.dinner_inkling, member.pregame_inkling, member.main_event_inkling = get_inklings(member, date)

    # Get date objects
    dates = [date + datetime.timedelta(days = x) for x in range(7)] 

    if (include_calendar == "true"):
        return render_to_response( "myInklingsAndCalendar.html",
            { "member" : member, "pastDate" : pastDate, "dates" : dates, "selectedDate" : date },
            context_instance = RequestContext(request) )
    else:
        return render_to_response( "myInklings.html",
            { "member" : member, "pastDate" : pastDate, "dates" : dates, "selectedDate" : date },
            context_instance = RequestContext(request) )

def get_inklings(member, date):
    """Returns the names and images for the logged in member's inkling locations."""
    # Get the name and image for the logged in member's dinner inkling location
    try:
        dinner_inkling = member.inklings.get(date = date, category = "dinner")
    except Inkling.DoesNotExist:
        dinner_inkling = None
    
    # Get the name and image for the logged in member's pregame inkling location
    try:
        pregame_inkling = member.inklings.get(date = date, category = "pregame")
    except Inkling.DoesNotExist:
        pregame_inkling = None

    # Get the name and image for the logged in member's main event inkling location
    try:
        main_event_inkling =  member.inklings.get(date = date, category = "mainEvent")
    except Inkling.DoesNotExist:
        main_event_inkling = None

    # Return the dinner, pregame, and main event locations
    return (dinner_inkling, pregame_inkling, main_event_inkling)


def create_network_view(request):
    """Creates a new Network object."""
    # Create a new network using the POST data and save it
    network = Network(name = request.POST["networkName"])
    network.save()

    # Copy the default network image
    shutil.copyfile(MEDIA_ROOT + "images/main/network.jpg", MEDIA_ROOT + "images/networks/" + str(network.id) + ".jpg")

    return HttpResponse()
    

def create_location_view(request):
    """Creates a new Location object."""
    # Create a new location using the POST data and save it
    location = Location(
        name = request.POST["locationName"],
        category = "Other",
        street = "No Street Submited",
        city = "City",
        state = "AL",
        zip_code = "00000",
        phone = "",
        website = "")
    location.save()

    # Copy the default location image
    shutil.copyfile(MEDIA_ROOT + "images/main/location.jpg", MEDIA_ROOT + "images/locations/" + str(location.id) + ".jpg")

    # Return the new location's ID
    return HttpResponse(location.id)


def invite_to_inkle_view(request):
    """Sends an email to the people whom the logged in member wants to join Inkle."""
    # Get the member who is logged in (or raise a 404 error if the member ID is invalid)
    try:
        member = Member.active.get(pk = request.session["member_id"])
    except Member.DoesNotExist:
        raise Http404()

    try:
        emails = request.POST["emails"]
    except KeyError:
        raise Http404()

    if ("," in emails):
        emails = [email.strip() for email in emails.split(",")]
    elif (";" in emails):
        emails = [email.strip() for email in emails.split(";")]
    else:
        emails = [email.strip() for email in emails.split()]
    
    valid_emails = []
    for email in emails:
        if ((is_email(email)) and ((email.endswith("@nd.edu")) or (email.endswith("@saintmarys.edu")) or (email.endswith("@hcc-nd.edu")))):
            #valid_emails.append(email)
            send_invite_to_inkle_email(member, email)
            
    #if (valid_emails):
    #    send_invite_to_inkle_email(member, valid_emails)

    return HttpResponse()


def send_email_verification_email_view(request, email = None):
    """Sends an email to the provided email allowing them to verify that email."""
    # Get the member who corresponds to the provided email (or raise a 404 error if no corresponding member exists)
    try:
        member = Member.objects.get(email = email)
    except Member.DoesNotExist:
        raise Http404()

    # Send the member an email to verifiy their email address (or raise a 404 error if their email is already verified)
    if (member.verified == False):
        send_email_verification_email(member)
    else:
        raise Http404()

    return HttpResponse()


def send_update_email_verification_email_view(request, email = None):
    """Sends an email to the provided email allowing them to verify their new email."""
    # Get the member who corresponds to the provided email (or raise a 404 error if no corresponding member exists)
    try:
        member = Member.active.get(email = email)
    except Member.DoesNotExist:
        raise Http404()

    # Send the member an email to verifiy their email address (or raise a 404 error if their email is already verified)
    if (member.verified == False):
        send_update_email_verification_email(member)
    else:
        raise Http404()

    return HttpResponse()


def send_password_reset_email_view(request, email = None):
    """Sends an email to the provided email allowing the corresponding to reset their password."""
    # Get the member who corresponds to the provided email and send them an email to reset their password (otherwise, don't do anything)
    try:
        member = Member.active.get(email = email)
        send_password_reset_email(member)
    except Member.DoesNotExist:
        pass

    return HttpResponse()


def send_contact_email_view(request):
    """Sends an email to support@inkleit.com."""
    # Get the member who is logged in (otherwise, set member to None)
    try:
        member = Member.active.get(pk = request.session["member_id"])
    except:
        member = None
    
    # Send the contact email if the required POST data is present
    try:
        send_contact_email(member, request.POST["name"], request.POST["email"], request.POST["subject"], request.POST["message"])
    except KeyError:
        raise Http404()

    return HttpResponse()


def send_request_to_follow_email_view(request, to_member_id = None):
    """Sends an email to the provided email allowing the corresponding to reset their password."""
    # Get the member who is sending the follow request (or raise a 404 error if the member ID is invalid)
    try:
        from_member = Member.active.get(pk = request.session["member_id"])
    except:
        raise Http404()

    # Get the member to whom the follow request is being sent (or raise a 404 error if the member ID is invalid)
    try:
        to_member = Member.active.get(pk = to_member_id)
    except member.DoesNotExist:
        raise Http404()

    # If the from_member has actually requested to follow the to_member, send the request to follow email
    if ((to_member.requested_email_preference) and (to_member.verified) and (from_member in to_member.requested.all())):
        send_request_to_follow_email(from_member, to_member)
    else:
        raise Http404()

    return HttpResponse()


def send_accept_request_email_view(request, from_member_id = None):
    """Sends an email to the provided email allowing the corresponding to reset their password."""
    # Get the member who is accepting the follow request (or raise a 404 error if the member ID is invalid)
    try:
        to_member = Member.active.get(pk = request.session["member_id"])
    except:
        raise Http404()

    # Get the member to who sent the follow request (or raise a 404 error if the member ID is invalid)
    try:
        from_member = Member.active.get(pk = from_member_id)
    except member.DoesNotExist:
        raise Http404()

    # If the from_member is actually following the to_member, send the request accepted email
    if ((from_member.accepted_email_preference) and (from_member.verified) and (from_member in to_member.followers.all())):
        send_accept_request_email(from_member, to_member)
    else:
        raise Http404()

    return HttpResponse()


def set_password_view(request):
    """Resets the member's password."""
    # Get the member corresponding to the provided email (or throw a 404 error)
    try:
        member = Member.active.get(pk = request.POST["memberID"])
    except:
        raise Http404()

    # Get the POST data
    password = request.POST["password"]
    confirm_password = request.POST["confirmPassword"]
    verification_hash = request.POST["verificationHash"]

    # If the passwords are long enough and match and the verification hash is correct, reset the member's password (or throw a 404 error)
    if ((len(password) >= 8) and (password == confirm_password) and (verification_hash == member.verification_hash)):
        member.set_password(password)
        member.save()
    else:
        raise Http404()
        
    return render_to_response( "resetPasswordConfirmation.html",
        { "m" : member },
        context_instance = RequestContext(request) )
