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

    return HttpResponse(response, mimetype="application/json")
   
@csrf_exempt
def s_get_blots_view(request):
    """Returns the names and IDs of the logged in user's blots."""

    # Get the logged in member
    member = Member.active.get(pk = request.session["member_id"])

    # Add "All Blots" to the response data
    data = {}
    data["entries"] = [{ "text" : "All Blots", "value" : -1 }]

    # Add each of the logged in member's blots to the response data
    for blot in member.blots.all():
        data["entries"].append({ "text" : blot.name, "value" : blot.id })

    # Create JSON object
    response = simplejson.dumps(data)

    return HttpResponse(response, mimetype="application/json")

@csrf_exempt
def m_test_view(request):
    """Tests if a request session is saved."""
    
    # If a member is already logged in, redirect them to the home page
    if ("member_id" in request.session):
        return HttpResponse(request.session["member_id"])
    return HttpResponse("Session not found")

@csrf_exempt
def m_get_others_inklings_view(request):
    
    # If a user is not logged in, redirect them to the login page
    #if ("member_id" not in request.session):
    #       return HttpResponse("Session not found")

    # Get the logged in member
    member = Member.active.get(pk = request.session["member_id"])
    #member = Member.active.get(pk = 3)

    date = ""
    people_type = ""
    people_id = ""
    inkling_type =""
    # Get the POST data
    if request.method == 'POST':
        try:
            postXML = request.POST['xml']
        except Exception as e:
            return HttpResponse("copy error: " + type(e).__name__ + " - " + e.message)
        try:
            postDom = parseString(postXML)
        except Exception as e:
            return HttpResponse("postDom error: " + type(e).__name__ + " - " + e.message)
        
        try:
            date = stripTag( postDom.getElementsByTagName("date")[0].toxml() )
            date = date.split("/")
            date = datetime.date(day = int(date[1]), month = int(date[0]), year = int(date[2]))
            people_type = stripTag( postDom.getElementsByTagName("peopleType")[0].toxml() )
            people_id = stripTag( postDom.getElementsByTagName("peopleId")[0].toxml() )
            inkling_type = stripTag( postDom.getElementsByTagName("inklingType")[0].toxml() )
        except Exception as e:
            return HttpResponse("Error accessing xml data in dom: " + type(e).__name__ + " - " + e.message)

    # Get others' inklings
    locations = get_others_inklings(member, date, people_type, people_id, inkling_type)

    # Get date objects
    #dates = [date + datetime.timedelta(days = x) for x in range(5)] 

    return render_to_response( "othersInklings.xml", {"locations" : locations}, mimetype='text/xml' )

@csrf_exempt
def m_get_invitations_view(request):
    """Gets the logged in member's request and returns the XML with the notifications."""
    # Get the member who is logged in (or redirect them to the login page)
    try:
        member = Member.active.get(pk = request.session["member_id"])
    except:
        return HttpResponse("Error getting active member.")
    
    numInvitations = str(len(member.invitations.all()))
    
    return render_to_response( "invitations.xml", {"member" : member}, mimetype='text/xml' )  

@csrf_exempt
def m_invitation_response_view(request):
    """Responds to the current invitation."""
    # Get the member who is logged in (or raise a 404 error if the member ID is invalid)
    try:
        member = Member.active.get(pk = request.session["member_id"])
    except:
        return HttpResponse("Error getting active member.")


    #Get the POST data
    if request.method == 'POST':
        try:
            postXML = request.POST['xml']
        except Exception as e:
            return HttpResponse("copy error: " + type(e).__name__ + " - " + e.message)
        try:
            postDom = parseString(postXML)
        except Exception as e:
            return HttpResponse("postDom error: " + type(e).__name__ + " - " + e.message)
        try:
            invitationID = stripTag( postDom.getElementsByTagName("id")[0].toxml() )
            response = stripTag( postDom.getElementsByTagName("response")[0].toxml() )
        except Exception as e:
            return HttpResponse("Error accessing xml data in dom: " + type(e).__name__ + " - " + e.message)

    # Get the invitation which is being responded to (or raise a 404 error if the invitation ID is invalid)
    try:
        invitation = member.invitations.get(pk = invitationID)
    except:
        return HttpResponse("Error: Could not get invitation object")

    # Make sure the invitation is actually in the logged in member's invitation list
    if (invitation not in member.invitations.all()):
        return HttpResponse("Error: Invitation does not belong to logged in member")

    # Update the logged in member's inkling if they accepted the current invitation
    if (response == "accepted"):
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

    return HttpResponse("completed")

@csrf_exempt
def m_get_people_groups(request, people_type = "blots"):
    try:
        member = Member.active.get(pk = request.session["member_id"])
    except:
        return HttpResponse("Error getting active member.")
    
    if people_type == "networks":
        return render_to_response( "networks.xml", {"member" : member}, mimetype='text/xml' )
    return render_to_response( "blots.xml", {"member" : member}, mimetype='text/xml' )

@csrf_exempt
def m_get_my_inklings_view(request):
    """Returns the logged in member's inklings for the inputted date."""
    # Get the logged in member (or raise a 404 error if the member ID is invalid)
    try:
        member = Member.active.get(pk = request.session["member_id"])
    except:
        raise Http404()

    #Get the POST data
    if request.method == 'POST':
        try:
            postXML = request.POST['xml']
        except Exception as e:
            return HttpResponse("copy error: " + type(e).__name__ + " - " + e.message)
        try:
            postDom = parseString(postXML)
        except Exception as e:
            return HttpResponse("postDom error: " + type(e).__name__ + " - " + e.message)
        try:
            date = stripTag( postDom.getElementsByTagName("date")[0].toxml() )
            date = date.split("/")
            date = datetime.date(day = int(date[1]), month = int(date[0]), year = int(date[2]))
        except Exception as e:
            return HttpResponse("Error accessing xml data in dom: " + type(e).__name__ + " - " + e.message)
    
    # Get the names and images for the logged in member's inkling locations
    member.dinner_inkling, member.pregame_inkling, member.main_event_inkling = get_inklings(member, date)
    
    return render_to_response( "myInklings.xml", { "member" : member }, mimetype='text/xml' )
    
@csrf_exempt
def m_set_my_inkling_view(request):
    """Returns the logged in member's inklings for the inputted date."""
    # Get the logged in member (or raise a 404 error if the member ID is invalid)
    try:
        member = Member.active.get(pk = request.session["member_id"])
    except:
        raise Http404()

    #Get the POST data
    if request.method == 'POST':
        try:
            postXML = request.POST['xml']
        except Exception as e:
            return HttpResponse("copy error: " + type(e).__name__ + " - " + e.message)
        try:
            postDom = parseString(postXML)
        except Exception as e:
            return HttpResponse("postDom error: " + type(e).__name__ + " - " + e.message)
        try:
            inklingDate = stripTag( postDom.getElementsByTagName("date")[0].toxml() )
            date = inklingDate.split("/")
            date = datetime.date(day = int(date[1]), month = int(date[0]), year = int(date[2]))
            inklingType = stripTag( postDom.getElementsByTagName("inklingType")[0].toxml() )
        except Exception as e:
            return HttpResponse("Error accessing xml data in dom: " + type(e).__name__ + " - " + e.message)
    else:
        inklingDate = "05/01/2012"
        date = datetime.date(2012, 5, 1) #Initialize date for testing
        inklingType = "pregame"

    pastDate = False
    if (date < datetime.date.today()):
        pastDate = True

    # Get the names and images for the logged in member's inkling locations
    dinner_inkling, pregame_inkling, main_event_inkling = get_inklings(member, date)
    if inklingType == "dinner":
        member.inkling = dinner_inkling
    elif inklingType == "pregame":
        member.inkling = pregame_inkling
    elif inklingType == "main_event":
        member.inkling = main_event_inkling
    else:
       return HttpResponse("Error: Invalid inkling type") 

    # Get date objects
    dates = [date + datetime.timedelta(days = x) for x in range(5)] 
    
    return render_to_response( "setMyInklingsMobile.html",
            { "member" : member, "pastDate" : pastDate, "inklingType" : inklingType, "inklingDate" : inklingDate},
            context_instance = RequestContext(request) )

@csrf_exempt
def m_location_suggestions_view(request):
    """Returns location suggestions for the inputted query."""
    # Get the member who is logged in (or redirect them to the login page)
    try:
        member = Member.active.get(pk = request.session["member_id"])
    except:
        raise Http404()
    
    # Get the POST data
    query = request.POST["query"].strip()
    
    categories = []
    
    # Get the location suggestions (and add them to the categories list if there are any)
    locations = locations_search_query(query)[0:4]
    member_place = members_search_query(query, Member.active.filter(pk = request.session["member_id"]))
    if (member_place):
        member_place.suggestionType = "members"
        categories.append((member_place,))
        locations = locations[0:3]
    if (locations):
        locations.suggestionType = "locations"
        categories.append((locations,))

    # Set the number of characters to show for each suggestion
    num_chars = 23

    return render_to_response( "inklingSuggestionsMobile.html",
        { "member" : member, "categories" : categories, "numChars" : num_chars },
        context_instance = RequestContext(request) )

@csrf_exempt
def m_invitee_suggestions_view(request):
    """Returns people invite suggestions for the inputted query."""
    # Get the member who is logged in (or redirect them to the login page)
    try:
        member = Member.active.get(pk = request.session["member_id"])
    except:
        raise Http404()
    
    # Get the POST data
    query = request.POST["query"].strip()
    
    categories = []
        
    # Get the member suggestions (and add them to the categories list if there are any)
    members = members_search_query(query, Member.active.filter(Q(id__in = member.following.filter(is_active=True)) | Q(id__in = member.followers.filter(is_active = True))))[0:3]
    members = list(members)

    # Get the blots
    blots = blots_search_query(query, member)[0:3]
    blots = list(blots)
    
    # Remove members who have already been invited 
    try:
        invites = request.POST["invitees"].split("|<|>|")
    except KeyError:
        raise Http404()

    i = 0
    while (i < len(invites)):
        if (invites[i] == "people"):
            try:
                m = Member.active.get(pk = int(invites[i + 1]))
                if (m in members):
                    members.remove(m)
            except Member.DoesNotExist:
                pass
        elif (invites[i] == "blots"):
            try:
                blot = Blot.objects.get(pk = int(invites[i + 1]))
                if (blot in blots):
                    blots.remove(blot)
            except Member.DoesNotExist:
                pass
        i += 1

    if (members):
        for m in members:
            m.name = m.first_name + " " + m.last_name
        categories.append((members, "People", "members"))
        
    # Get the blots suggestions (and add them to the categories list if there are any)
    if (blots):
        categories.append((blots, "Blots", "blots"))
    
    # Set the number of characters to show for each suggestion
    num_chars = 20
    
    return render_to_response( "inviteeSuggestionsMobile.html",
        { "categories" : categories, "numChars" : num_chars },
        context_instance = RequestContext(request) )

@csrf_exempt
def m_create_inkling_view(request):
    """Adds an inkling to the logged in member's inklings."""
    # Get the logged in member (or raise a 404 error if the member ID is invalid)
    try:
        member = Member.active.get(pk = request.session["member_id"])
    except:
        raise Http404()

    # Get the POST data
    try:
        inkling_type = request.POST["inklingType"]
        if inkling_type == "main_event":
            inkling_type = "mainEvent"
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
    
@csrf_exempt
def m_remove_inkling_view(request):
    """Removes an inkling from the logged in member's inklings."""
    # Get the logged in member (or raise a 404 error if the member ID is invalid)
    try:
        member = Member.active.get(pk = request.session["member_id"])
    except:
        raise Http404()
    
    # Get the POST data
    inkling_type = request.POST["inklingType"]
    if inkling_type == "main_event":
        inkling_type = "mainEvent"
    date = request.POST["date"].split("/")
    date = datetime.date(day = int(date[1]), month = int(date[0]), year = int(date[2]))
    
    # Get the inkling for the member/type/date combination and remove it if possible
    try:
        inkling = member.inklings.get(category = inkling_type, date = date)
        remove_inkling(member, inkling)
    except Inkling.DoesNotExist:
        pass

    return HttpResponse()

@csrf_exempt
def m_inkling_invitations_view(request):
    # Get the logged in member (or raise a 404 error if the member ID is invalid)
    try:
        member = Member.active.get(pk = request.session["member_id"])
    except:
        raise Http404()

    try:
        invites = request.POST["invitees"].split("|<|>|")
        message = request.POST["message"]
        inkling = Inkling.objects.get(pk = request.POST["inklingID"])
    except:
        raise Http404()

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

    invitation = Invitation(description = message, inkling = inkling, from_member = member)
    invitation.save()
    for m in members:
        conflicting_invitation = m.invitations.filter(inkling = inkling, from_member = member)
        if (conflicting_invitation):
            m.invitations.remove(conflicting_invitation[0])

        m.invitations.add(invitation)

    return HttpResponse(invitation.id)

@csrf_exempt
def m_send_inkling_invitations_view(request):
    # Get the logged in member (or raise a 404 error if the member ID is invalid)
    try:
        member = Member.active.get(pk = request.session["member_id"])
    except:
        raise Http404()

    try:
        invites = request.POST["invitees"].split("|<|>|")
        message = request.POST["message"]
        inkling = Inkling.objects.get(pk = request.POST["inklingID"])
        invitation = Invitation.objects.get(pk = request.POST["invitationID"])
    except:
        raise Http404()

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

    for m in members:
        if (m.invitations.filter(inkling = inkling, from_member = member)):
            if (m.invited_email_preference and m.verified):
                send_inkling_invitation_email(member, m, inkling, message)

    return HttpResponse()

@csrf_exempt
def m_location_view(request):
    """Gets the members who are going to the inputted location today and returns XML."""
    # Get the logged in member (or raise a 404 error if the member ID is invalid)
    try:
        member = Member.active.get(pk = request.session["member_id"])
    except:
        return HttpResponse("Error getting member")

    # If the request type is POST, validate the username and password combination
    if request.method == 'POST':
        try:
            postXML = request.POST['xml']
        except Exception as e:
            return HttpResponse("copy error: " + type(e).__name__ + " - " + e.message)
        try:
            postDom = parseString(postXML)
        except Exception as e:
            return HttpResponse("postDom error: " + type(e).__name__ + " - " + e.message)
        try:
            location_id = stripTag( postDom.getElementsByTagName("locationId")[0].toxml() )
            location_type = stripTag( postDom.getElementsByTagName("locationType")[0].toxml() )
            date = stripTag( postDom.getElementsByTagName("date")[0].toxml() )
            date = date.split("/")
            date = datetime.date(day = int(date[1]), month = int(date[0]), year = int(date[2]))
        except Exception as e:
            return HttpResponse("Error accessing xml data in dom: " + type(e).__name__ + " - " + e.message)
    else:
        location_id = 192
        date = datetime.date(day = 30, month = 4, year = 2012)

    # Get the location corresponding to the inputted ID (or throw a 404 error if it is invalid)
    try:
        location = Location.objects.get(pk = location_id)
    except:
        return HttpResponse("Error getting location")

    if request.method == 'POST':
        if location_type == "memberPlace":
            member = m_get_location_inklings(request.session["member_id"], None, location_id, date)
        else:
            member = m_get_location_inklings(request.session["member_id"], location_id, None, date)
    else:
        member = m_get_location_inklings(request.session["member_id"], location_id, None, date)

    return render_to_response( "locationMobile.xml", { "member" : member }, mimetype='text/xml' )

@csrf_exempt
def m_get_location_inklings(member_id = None, location_id = None, member_place_id = None, date = datetime.date.today()):
    """Returns a member object with additional fields indicating inklings at the input location for the input datetime date object"""
    # Get the member who is logged in (or redirect them to the login page)
    try:
        member = Member.active.get(pk = member_id)
    except:
        return HttpResponse("m_get_locations_inklings failed to get member")
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
    
