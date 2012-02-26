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
def login_view(request):
    """Either logs in a member or returns the login errors."""
    
    """# If a member is already logged in, redirect them to the home page
    if ("member_id" in request.session):
        return HttpResponseRedirect("/")"""

    # Create dictionaries to hold the POST data and the invalid errors
    data = { "email" : "", "password" : "", "month" : 0, "year" : 0 }
    invalid = { "errors" : [] }

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
                return HttpResponse(True)

            # Otherwise, set the invalid dictionary
            else:
                invalid["email"] = True
                invalid["password"] = True
                invalid["errors"].append("Invalid email/password combination")
    
    return render_to_response( "sample.xml", {}, mimetype='text/xml')
        
