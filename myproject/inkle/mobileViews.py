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

def login_view(request):
    """Either logs in a member or returns the login errors."""
    
    return render_to_response( "404.html", {}, context_instance = RequestContext(request) )