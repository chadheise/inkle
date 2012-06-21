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
    #member = Member.active.get(pk = request.session["member_id"])
    member = Member.active.get(pk = 1)

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
def s_get_all_inklings_view(request):
    """Returns all the inklings."""

    # Get the logged in member
    member = Member.objects.get(pk = 1)

    inklings = member.inklings.all()

    return render_to_response( "s_allInklings.html",
        { "inklings" : inklings  },
        context_instance = RequestContext(request) )

@csrf_exempt
def s_get_inkling_view(request):
    """Returns a single inkling."""

    # Get the current inkling
    inkling_id = request.POST["inkling_id"]
    inkling = Inkling.objects.get(pk = inkling_id)

    return render_to_response( "s_inkling.html",
        { "inkling" : inkling },
        context_instance = RequestContext(request) )

@csrf_exempt
def s_get_my_inklings_view(request):
    """Returns my inklings."""

    # Get the logged in member
    member = Member.objects.get(pk = 3)

    inklings = member.inklings.all()

    return render_to_response( "s_myInklings.html",
        { "inklings" : inklings  },
        context_instance = RequestContext(request) )
