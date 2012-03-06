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
    #member = Member.active.get(pk = request.session["member_id"])
    member = Member.active.get(pk = 3)

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