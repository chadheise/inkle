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

from myproject.settings import MEDIA_ROOT

from django.views.decorators.csrf import csrf_exempt
from xml.dom.minidom import parse, parseString

@csrf_exempt
def login_view(request):
    """Either logs in a member or returns the login errors."""
    
    postdata = "Nothing loaded"
    if request.method == 'POST':
        postXML = request.POST.copy()
        #postDom = parseString(postXML)
        #emailTag = postDom.getElementsByTagName("email")[0].toxml()
        #strip off the tag (<tag>data</tag>  --->   data):
        #email=emailTag.replace('<email>','').replace('</email>','')
    
    #return HttpResponse("postXML = " + postXML + " -------------- email = " + email)
    return HttpResponse(postXML)
    #return render_to_response( "sample.xml", {}, mimetype='text/xml')
