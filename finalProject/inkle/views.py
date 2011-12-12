from django.template import RequestContext
from django.http import HttpResponse, HttpResponseRedirect, Http404

from django.shortcuts import render_to_response

from django.contrib.auth.models import User
from django.contrib import auth

from finalProject.inkle.models import *
from finalProject.inkle.forms import *

from django.db.models import Q

import datetime

from databaseViews import *

def home_view(request):
    # If a user is not logged in, redirect them to the login page
    if ("member_id" not in request.session):
           return HttpResponseRedirect("/inkle/login")
    
    # Get the member who is logged in
    member = Member.objects.get(pk = request.session["member_id"])
    
    member.num_requests = 0
    for r in member.requested.all():
        member.num_requests += 1

    member.spheres2 = member.spheres.all()
    member.circles2 = member.circles.all()

    locations = Location.objects.all()
    for l in locations:
        l.count = "87"

    return render_to_response( "home.html",
        { "member" : member, "locations" : locations },
        context_instance = RequestContext(request) )

def manage_view(request, defaultContent = "circles"):
    # If a user is not logged in, redirect them to the login page
    if ("member_id" not in request.session):
          return HttpResponseRedirect("/inkle/login")

    #Get default data to load
    #defaultContent = "circles"
    #if ("defaultContent" in request.POST):
    #    defaultContent = str(request.POST["defaultContent"])

    # Get the member who is logged in
    member = Member.objects.get(pk = request.session["member_id"])
    member.spheres2 = member.spheres.all()

    member.num_requests = 0
    for r in member.requested.all():
        member.num_requests += 1

    print {"member" : member, "defaultContent" : defaultContent}

    return render_to_response( "manage.html",
        {"member" : member, "defaultContent" : defaultContent},
        context_instance = RequestContext(request) )
    
def location_view(request, location_id = None):
    # Get the member who is logged in
    member = Member.objects.get(pk = request.session["member_id"])
    
    # If the location ID is invalid, throw a 404 error
    try:
        location = Location.objects.get(pk = location_id)
    except:
        raise Http404()

    return render_to_response( "location.html",
        {"member" : member, "location" : location},
        context_instance = RequestContext(request) )

def search_view(request, query = ""):
    # If a user is not logged in, redirect them to the login page
    if ("member_id" not in request.session):
           return HttpResponseRedirect("/inkle/login")
    
    # Get the member who is logged in
    member = Member.objects.get(pk = request.session["member_id"])

    member.num_requests = 0
    for r in member.requested.all():
        member.num_requests += 1

    split_query = query.split()
    if (len(split_query) == 1):
        members = Member.objects.filter(Q(first_name__contains = query) | Q(last_name__contains = query))
    else:
        members = Member.objects.filter(Q(first_name__contains = query) | Q(last_name__contains = query) | Q(first_name__contains = split_query[0]) | Q(last_name__contains = split_query[1]))
    members.length = len(members)

    locations = Location.objects.filter(Q(name__contains = query))
    locations.length = len(locations)
    
    spheres = Sphere.objects.filter(Q(name__contains = query))
    spheres.length = len(spheres)

    for m in members:
        m.button_list = []
        
        # Prevent following
        if member.followers.filter(follower=m):
            m.button_list.append(buttonDictionary["prevent"])
        
        if m in member.pending.all() and m != member:
            m.relationship = "pending"
            m.button_list.append(buttonDictionary["revoke"])
        elif member in [f.follower for f in m.followers.all()] and m != member:
            m.relationship = "friend"
            #Add circles
            m.button_list.append(buttonDictionary["stop"])
            m.button_list.append(buttonDictionary["circles"])
            m.circles2 = [c for c in member.circles.all()]
            for c in m.circles2:
                    c.members2 = c.members.all()
        elif m != member:
            m.relationship = "other"
            m.button_list.append(buttonDictionary["request"])
        else:
            m.relationship = "self"
            
        temp = [x for x in Member.objects.all() if (member in [y.follower for y in x.followers.all()] )]
        m.num_mutual_followings = len( [x for x in temp if m in [y.follower for y in x.followers.all()] ] )

    for s in spheres:
        s.button_list = []
        if s in member.spheres.all():
            s.button_list.append(buttonDictionary["leave"])
        else:
            s.button_list.append(buttonDictionary["join"])


    return render_to_response( "search.html",
        {"member" : member, "query" : query, "members" : members, "locations" : locations, "spheres" : spheres},
        context_instance = RequestContext(request) )

def requested_view(request):
    # If a user is not logged in, redirect them to the login page
    if ("member_id" not in request.session):
           return HttpResponseRedirect("/inkle/login")
    
    # Get the member who is logged in
    member = Member.objects.get(pk = request.session["member_id"])

    members = member.requested.all()

    for m in members:
        temp = [x for x in Member.objects.all() if (member in [y.follower for y in x.followers.all()] )]
        m.num_mutual_followings = len( [x for x in temp if m in [y.follower for y in x.followers.all()] ] )
        m.relationship = "pending"
        m.button_list = []
        m.button_list.append(buttonDictionary["reject"])
        m.button_list.append(buttonDictionary["accept"])

    return render_to_response( "requested.html",
        {"member" : member, "members" : members},
        context_instance = RequestContext(request) )

def followers_view(request):
     # If a user is not logged in, redirect them to the login page
     if ("member_id" not in request.session):
            return HttpResponseRedirect("/inkle/login")

     # Get the member who is logged in
     member = Member.objects.get(pk = request.session["member_id"])

     members = [f.follower for f in member.followers.all()]

     for m in members:
         temp = [x for x in Member.objects.all() if (member in [y.follower for y in x.followers.all()] )]
         m.num_mutual_followings = len( [x for x in temp if m in [y.follower for y in x.followers.all()] ] )
         m.relationship = "friend"
         
         m.button_list = []
         m.button_list.append(buttonDictionary["prevent"])
         if not m.followers.filter(follower=member):
            m.button_list.append(buttonDictionary["request"])
            m.relationship = "other"

     return render_to_response( "followers.html",
        {"member" : member, "members" : members},
        context_instance = RequestContext(request) )
    
def circles_view(request):
    # Get the member who is logged in
    member = Member.objects.get(pk = request.session["member_id"])
    
    circles = member.circles.all()
    
    for c in circles:
        c.ms = c.members.all()

    members = member.accepted.all()
    for m in members:
        m.relationship = "friend"
        temp = [x for x in Member.objects.all() if (member in [y.follower for y in x.followers.all()] )]
        m.num_mutual_followings = len( [x for x in temp if m in [y.follower for y in x.followers.all()] ] )
        m.button_list = []
        m.button_list.append(buttonDictionary["stop"])
        #Add circles
        m.button_list.append(buttonDictionary["circles"])
        m.circles2 = [c for c in member.circles.all()]
        for c in m.circles2:
                c.members2 = c.members.all()

    return render_to_response( "circles.html",
        {"member" : member,"members" : members,"circles" : circles},
        context_instance = RequestContext(request) )

def circle_content_view(request):
    # Get the circle which was clicked
    circle_id = request.POST["circleID"]
    
    member = Member.objects.get(pk = request.session["member_id"])
    
    circle = None
    if (int(circle_id) == -1):
        members = member.accepted.all()
    else:
        circle = Circle.objects.get(pk = circle_id)
        members = circle.members.all()

    for m in members:
        m.relationship = "friend"
        temp = [x for x in Member.objects.all() if (member in [y.follower for y in x.followers.all()] )]
        m.num_mutual_followings = len( [x for x in temp if m in [y.follower for y in x.followers.all()] ] )
        m.button_list = []
        m.button_list.append(buttonDictionary["stop"])
        #Add circles
        m.button_list.append(buttonDictionary["circles"])
        m.circles2 = [c for c in member.circles.all()]
        for c in m.circles2:
                c.members2 = c.members.all()

    return render_to_response("circleContent.html", 
        {"circle" : circle, "members" : members},
        context_instance = RequestContext(request) )

def spheres_view(request):
    # Get the member who is logged in
    member = Member.objects.get(pk = request.session["member_id"])

    spheres = member.spheres.all()

    for s in spheres:
        s.button_list = []
        s.button_list.append(buttonDictionary["leave"])

    return render_to_response( "spheres.html",
        {"member" : member,"spheres" : spheres},
        context_instance = RequestContext(request) )

def suggestions_view(request, query = ""):
    # If a user is not logged in, redirect them to the login page
    if ("member_id" not in request.session):
           return HttpResponseRedirect("/inkle/login")

    query = request.POST["query"]
    query_type = request.POST["type"]

    if (query_type == "inkling"):
        locations = Location.objects.filter(Q(name__contains = query))
        categories = [(locations,)]
        footerSubject = "Location"
        
    elif (query_type == "search"):
        categories = []

        people = Member.objects.filter(Q(username__contains = query) | Q(first_name__contains = query) | Q(last_name__contains = query))
        if (people):
            for p in people:
                p.name = p.first_name + " " + p.last_name
            categories.append((people, "People"))
        
        locations = Location.objects.filter(Q(name__contains = query) | Q(city__contains = query))
        if (locations):
            categories.append((locations, "Locations"))

        spheres = Sphere.objects.filter(Q(name__contains = query))
        if (spheres):
            categories.append((spheres, "Spheres"))
        
        footerSubject = ""

    elif (query_type == "addToCircle"):
        circle_id = request.POST["circleID"]
        circle = Circle.objects.get(pk = circle_id)

        member = Member.objects.get(pk = request.session["member_id"])
        following = [x for x in Member.objects.all() if (member in [y.follower for y in x.followers.all()] )]
        circle_members = circle.members.all()
        people = list(set(following).difference(set(circle_members)))
       
        categories = []
        if (people):
            for p in people:
                p.name = p.first_name + " " + p.last_name
            categories = [(people,)]

        footerSubject = ""

    return render_to_response("suggestions.html",
        {"categories" : categories, "footerSubject" : footerSubject},
        context_instance = RequestContext(request) )
    
    return HttpResponse()

def login_view(request):
    """User login."""
    # If a user is already logged in, go to the main page
    if "member_id" in request.session:
        return HttpResponseRedirect("/inkle")
    
    # If the POST data is empty, return an empty form
    if (not request.POST):
        log_form = login_form()
        reg_form = registration_form()
    
    # If the user has submitted POST data, see if the information is valid
    else:
        log_form = login_form(request.POST)
        if log_form.is_valid():
            # Check if a member with the given username already exists
            try:
                member = Member.objects.get(username = log_form.cleaned_data["email"])
            
                # If the member's credentials are correct, log them in and return them to the home page
                if (member.password == log_form.cleaned_data["password"]):
                    request.session["member_id"] = member.id
                    return HttpResponseRedirect("/inkle/")
            except:
                pass
        
        reg_form = registration_form(request.POST)
        if reg_form.is_valid():
            first_name = reg_form.cleaned_data["first_name"]
            last_name = reg_form.cleaned_data["last_name"]
            email = reg_form.cleaned_data["email"]
            email_verify = reg_form.cleaned_data["email_verify"]
            password = reg_form.cleaned_data["password"]
            gender = reg_form.cleaned_data["gender"]

            if (email == email_verify):
                member = Member(
                    first_name = first_name,
                    last_name = last_name,
                    username = email,
                    password = password,
                    email = email,
                    gender = gender
                )
                member.is_staff = True
                member.save()
                
                # Log the user in
                request.session["member_id"] = member.id
                return HttpResponseRedirect("/inkle/")

    return render_to_response( "login.html",
        {"login_form" : log_form, "registration_form" : reg_form},
        context_instance=RequestContext(request) )

def logout_view(request):
    """Logs out the current user."""
    try:
        del request.session["member_id"]
    except:
        pass

    return HttpResponseRedirect("/inkle/login/")
