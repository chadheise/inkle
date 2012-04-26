from django.template import RequestContext
from django.http import HttpResponse, HttpResponseRedirect, Http404

from django.shortcuts import render_to_response

from django.contrib.auth.models import User
from django.contrib import auth

from myproject.inkle.models import *
from myproject.inkle.emails import *

from django.db.models import Q

import datetime
import shutil
from PIL import Image

from databaseViews import *

from myproject.settings import MEDIA_ROOT

#Modules needed specifically for mobile views
from django.views.decorators.csrf import csrf_exempt
from django.core import serializers
from xml.dom.minidom import parse, parseString
import os
import sys
from views import *

def stripTag(string):
    tagLength = 0
    for c in string:
        if tagLength > 0:
            tagLength += 1
        if c == "<":
            tagLength = 1
        elif c == ">":
            break
    return string.lstrip().rstrip()[ tagLength : -(tagLength + 1) ]
   
@csrf_exempt
def m_login_view(request):
    """Either logs in a member or returns the login errors."""
    
    """# If a member is already logged in, redirect them to the home page
    if ("member_id" in request.session):
        return HttpResponseRedirect("/")"""

    # Create dictionaries to hold the POST data and the invalid errors
    data = { "email" : "", "password" : "", "month" : 0, "year" : 0 }
    invalid = { "errors" : [] }
    valid = False #Assume invalid data by default

    """# Get the next location after the login is successful (or set it to the home page if it is not set)
    try:
        next_location = request.GET["next"]
    except:
        next_location = "/" """
    
    # If the request type is POST, validate the username and password combination
    if request.method == 'POST':
        try:
            #temp = request.POST.copy()
            #postXML = serializers.deserialize('xml', temp)
            postXML = request.POST['xml']
        except Exception as e:
            return HttpResponse("copy error: " + type(e).__name__ + " - " + e.message)
        try:
            postDom = parseString(postXML)
        except Exception as e:
            return HttpResponse("postDom error: " + type(e).__name__ + " - " + e.message)
        
        try:
            data["email"] = stripTag( postDom.getElementsByTagName("email")[0].toxml() )
            data["password"] = stripTag( postDom.getElementsByTagName("password")[0].toxml() )
        except Exception as e:
            return HttpResponse("Error accessing xml data in dom: " + type(e).__name__ + " - " + e.message)
    
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
                invalid["errors"].append("Invalid email/password combination")
    
    return render_to_response( "login.xml", {"loginInvalid" : invalid}, mimetype='text/xml' )

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
        inklingDate = "04/26/2012"
        date = datetime.date(2012, 4, 26) #Initialize date for testing
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
    members = members_search_query(query, Member.active.filter(Q(id__in = member.following.filter(is_active=True)) | Q(id__in = member.followers.filter(is_active = True))))[0:5]
    members = list(members)

    # Get the blots
    blots = blots_search_query(query, member)[0:5]
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
    date = request.POST["date"].split("/")
    date = datetime.date(day = int(date[1]), month = int(date[0]), year = int(date[2]))
    
    # Get the inkling for the member/type/date combination and remove it if possible
    try:
        inkling = member.inklings.get(category = inkling_type, date = date)
        remove_inkling(member, inkling)
    except Inkling.DoesNotExist:
        pass

    return HttpResponse()

#@csrf_exempt
#def m_image_location(request, location_type = "location", location_id = None):
#    """Gets an image for a specified location or member place"""
#    response = HttpResponse(mimetype="image/jpg")
#    if location_type == "place":
#        image = Image.open(MEDIA_ROOT + "images/main/man.jpg");
#        image = image.resize((75, 75))
#        image.save(response, "JPG")
#    else:
#        image = Image.open(MEDIA_ROOT + "images/main/woman.jpg");
#        image = image.resize((75, 75))
#        image.save(response, "JPG")
#    return response
    