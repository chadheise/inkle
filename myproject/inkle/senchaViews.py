# HTTP response modules
from django.template import RequestContext
from django.http import HttpResponse, HttpResponseRedirect, Http404
from django.shortcuts import render_to_response
from django.template.loader import render_to_string

# TODO: get rid of the whole csrf_exempt thing
# CSRF exemple views module
from django.views.decorators.csrf import csrf_exempt

# JSON module
from django.utils import simplejson
# URL module
import urllib2

# Inkle database models
from myproject.inkle.models import *

# Regular expression database querying module
from django.db.models import Q

# Date/time module
import datetime

import string
import random

def s_is_logged_in(request):
    """Returns True if a user is logged in or False otherwise."""
    return HttpResponse("member_id" in request.session)


@csrf_exempt
def s_login_view(request):
    """Logs a member in or returns the login error."""
    print "logging in"
    # Get the inputted email and password
    try:
        if ("facebookId" in request.POST):
            facebookId = request.POST["facebookId"]
            facebookAccessToken = request.POST["facebookAccessToken"]
            # Create random password 32 chars long
            password = ''.join(random.choice(string.ascii_letters + string.punctuation + string.digits) for x in range(32))
            first_name = request.POST["first_name"]
            last_name = request.POST["last_name"]
            email = request.POST["email"]
            day = int(request.POST["birthday"].split('/')[1])
            month = int(request.POST["birthday"].split('/')[0])
            year = int(request.POST["birthday"].split('/')[2])
            birthday = datetime.date(day = day, month = month, year = year)
            gender = request.POST["gender"][0]
        else:
            email = request.POST["email"]
            password = request.POST["password"]
            facebookId = False
    except KeyError as e:
        return HttpResponse("Error accessing request POST data: " + e.message)
    
    # Create a string to hold the login error
    response_error = ""

    # Validate the email and password
    if (not facebookId):
        if ((not email) and (not password)):
            response_error = "Email and password not specified"
        elif (not email):
            response_error = "Email not specified"
        elif (not password):
            response_error = "Password not specified"

    # Log in the member if their email and password are correct
    if (not response_error):
        try:
            # Get the member by facebookId
            if (facebookId):
                member = Member.active.get(facebookId = facebookId)
                #Should allow user to update their email if their facebook email doesn't match the one in inkle
                # Need to validate facebook authentication
            # Get the member according to the provided email
            else:
                member = Member.active.get(email = email)
        except:
            member = []
            
        if (facebookId and not member):
            try:
                #If the user has not logged in with facebook before but they registered with their email
                member = Member.active.get(email = email)
                member.facebookId = facebookId
                member.save()
            except:
                # Create the new member
                member = Member(
                    facebookId = facebookId,
                    first_name = first_name,
                    last_name = last_name,
                    username = email,
                    email = email,
                    birthday = birthday,
                    gender = gender
                )
                # Set the new member's password
                member.set_password(password)
                member.save() # Save the new member

        if (facebookId):
            print "facebook login"
            print "member is active: " + str(member.is_active)
            # Confirm the user is active and log them in
            try:
                if (member and member.is_active):
                    request.session["member_id"] = member.id
                    fbRequest = "https://graph.facebook.com/me?access_token=" + facebookAccessToken
                    fbResponse = urllib2.urlopen(fbRequest).read() # Will throw an exception if access token can't be validated
                    request.session["facebook_access_token"] = facebookAccessToken
                    fbData = simplejson.loads(fbResponse)
                    for fbFriend in fbData["data"]:
                        print fbFriend["first_name"] + " " + fbFriend["last_name"]
                    member.last_login = datetime.datetime.now()
                    member.save()
                # Otherwise, add to the errors list
                else:
                    response_error = "Could not login using Facebook"
            except Exception, e:
                response_error = "Could not login using Facebook"
        else:
            print "normal login"
            print "member is active: " + str(member.is_active) 
            # Confirm the username and password combination and log the member in
            if (member and member.is_active and member.check_password(password)):
                request.session["member_id"] = member.id
                print "request.session: " + str(request.session["member_id"])
                member.last_login = datetime.datetime.now()
                member.save()
            # Otherwise, add to the errors list
            else:
                response_error = "Invalid login combination"

    # Determine if the login was successful
    if (response_error):
        success = False
    else:
        success = True

    # Create and return a JSON object
    response = simplejson.dumps({
        "success" : success,
        "error" : response_error
    })
    request.session.modified = True
    return HttpResponse(response, mimetype = "application/json")


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
            # If the group ID is -1, add all the members who are in none of the logged-in member's groups
            if (group_id == "-1"):
                not_grouped_members = list(member.friends.all())
                for g in member.group_set.all():
                    for m in g.members.all():
                        if (m in not_grouped_members):
                            not_grouped_members.remove(m)

                members.extend(not_grouped_members)

            # Otherwise, add each member from the group corresponding to the current group ID
            else:
                group = Group.objects.get(pk = group_id)
                if (group.creator == member):
                    for m in group.members.all():
                        if (m not in members):
                            members.append(m)

    # Otherwise, if no groups are selected, get all of the logged-in members's active friends
    else:
        members = member.friends.filter(is_active = True)

    # Get the date, or set it to today if no date is specified
    try:
        day = int(request.POST["day"])
        month = int(request.POST["month"])
        year = int(request.POST["year"])
        date = datetime.date(year, month, day)
    except KeyError:
        date = datetime.date.today()

    # Get a list of all the inklings the members are attending on the specified date
    response_inklings = []
    inklings = []
    for m in members:
        for i in m.inklings.filter(date = date):
            if i not in inklings:
                try:
                    sp = SharingPermission.objects.get(creator = m, inkling = i)
                except:
                    raise Http404()
                if (member in list(sp.members.all())):
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
def s_groups_view(request):
    """Returns a list of the logged-in member's groups."""
    # Get the logged-in member
    try:
        member = Member.active.get(pk = request.session["member_id"])
    except (Member.DoesNotExist, KeyError) as e:
        raise Http404()

    # Get the view that is requesting the current groups list
    try:
        view = request.POST["view"]
    except:
        raise Http404()

    # Get the current inkling if we are in the invites view
    if (view == "invites"):
        try:
            inkling = Inkling.objects.get(pk = request.POST["inklingId"])
        except:
            raise Http404()
   
    # Get a list of the logged-in member's friends who are not in one of the logged-in member's groups
    not_grouped_members = list(member.friends.all())
    for g in member.group_set.all():
        for m in g.members.all():
            if (m in not_grouped_members):
                not_grouped_members.remove(m)

    # Get an alphabetical list of the logged-in member's groups
    groups = list(member.group_set.all())
    groups.sort(key = lambda g : g.name)

    # Create a list to hold the response data
    response_groups = []

    # Get the HTML for the logged-in member's group list items
    for g in groups:
        if (view == "allInklings"):
            g.selected = True
        elif (view == "invites"):
            g.selected = True
            for m in g.members.all():
                if (not inkling.member_has_pending_invitation(m)):
                    g.selected = False
                    break

        if (view == "friends"):
            g.num_members = g.members.count()
            html = render_to_string( "s_friendsViewGroupListItem.html", {
                "g" : g,
            })
        else:
            html = render_to_string( "s_groupListItem.html", {
                "g" : g
            })

        response_groups.append({
            "id" : g.id,
            "html" : html
        })

    # Create a "Not Grouped" group
    not_grouped_group = { "id" : -1, "name" : "Not Grouped" }
    
    # Determine if the "Not Grouped" group should be selected
    not_grouped_group["selected"] = True
    if (view == "invites"):
        for m in not_grouped_members:
            if (not inkling.member_has_pending_invitation(m)):
                not_grouped_group["selected"] = False
                break

    # If the current view is the friends view, determine the number of friends who are not grouped and genearte the HTML
    if (view == "friends"):
        not_grouped_members = list(member.friends.all())
        for g in member.group_set.all():
            for m in g.members.all():
                if (m in not_grouped_members):
                    not_grouped_members.remove(m)
        not_grouped_group["num_members"] = len(not_grouped_members)

        html = render_to_string( "s_friendsViewGroupListItem.html", {
            "g" : not_grouped_group,
        })

    # Otherwise, simply generate the HTML
    else:
        html = render_to_string( "s_groupListItem.html", {
            "g" : not_grouped_group
        })

    # Add the "Not Grouped" group to the response list
    response_groups.append({
        "id" : not_grouped_group["id"],
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

@csrf_exempt
def s_new_inkling_privacy_form_view(request):
    """Returns the HTML for a single inkling"""
    # Get the logged-in member
    try:
        member = Member.active.get(pk = request.session["member_id"])
    except (Member.DoesNotExist, KeyError) as e:
        raise Http404()

    # Return the HTML for the current inkling
    return render_to_response( "s_newInklingPrivacyForm.html",
        { "member" : member },
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
    """Returns a list of the feed updates and comments for the inputted inkling."""
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

    # Create a list to hold all the feed items (comments and updates)
    response_feed_items = []

    # Add the inkling creation feed update to the response list
    html = render_to_string( "s_inklingFeedUpdateListItem.html", {
        "inkling" : inkling,
        "member" : member
    })

    response_feed_items.append({
        "html" : html,
        "date" : inkling.date_created
    })

    # Add the feed comments to the response list
    for feed_comment in inkling.feedcomment_set.all():
        html = render_to_string( "s_inklingFeedCommentListItem.html", {
            "feed_comment" : feed_comment,
            "member" : member
        })

        response_feed_items.append({
            "html" : html,
            "date" : feed_comment.date_created
        })

    # Add the feed updates to the response list
    for feed_update in inkling.feedupdate_set.all():
        html = render_to_string( "s_inklingFeedUpdateListItem.html", {
            "feed_update" : feed_update,
            "member" : member
        })

        response_feed_items.append({
            "html" : html,
            "date" : feed_update.date_created
        })


    # Sort the feed items chronologically
    response_feed_items.sort(key = lambda feed_item : feed_item["date"])
    for feed_item in response_feed_items:
        del feed_item["date"]

    # Create and return a JSON object
    response = simplejson.dumps(response_feed_items)
    return HttpResponse(response, mimetype = "application/json")


@csrf_exempt
def s_add_feed_comment_view(request):
    """Adds a new comment to the inputted inkling's feed."""
    # Get the logged-in member
    try:
        member = Member.active.get(pk = request.session["member_id"])
    except (Member.DoesNotExist, KeyError) as e:
        raise Http404()

    # Get the current inkling and the new comment's text
    try:
        inkling = Inkling.objects.get(pk = request.POST["inklingId"])
        text = request.POST["text"]
    except:
        raise Http404()

    # Create the new comment
    FeedComment.objects.create(creator = member, inkling = inkling, text = text)

    return HttpResponse()


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


def s_num_inkling_invitations_view(request):
    """Returns the number of inklings to which the logged-in member has pending invitations."""
    # Get the logged-in member
    try:
        member = Member.active.get(pk = request.session["member_id"])
    except (Member.DoesNotExist, KeyError) as e:
        raise Http404()
    
    # Return the number of inklings to which the logged-in member has pending invitations
    return HttpResponse(member.inkling_invitations_received.filter(status = "pending").count())


@csrf_exempt
def s_inkling_invitations_view(request):
    """Returns a list of the inklings to which the logged-in member has pending invitations."""
    # Get the logged-in member
    try:
        member = Member.active.get(pk = request.session["member_id"])
    except (Member.DoesNotExist, KeyError) as e:
        raise Http404()
    
    # Get a list of the inklings to which the logged-in member has pending invitations
    response_invites = []
    for invitation in member.inkling_invitations_received.filter(status = "pending"):
        html = render_to_string( "s_inklingInvitationListItem.html", {
            "invitation" : invitation
        })
        
        response_invites.append({
            "id" : invitation.id,
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

    # Get the number of friends who have been invited to this inkling by the logged-in member
    num_invited_friends = InklingInvitation.objects.filter(sender = member, inkling = inkling).count()
    
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
    except (Inkling.DoesNotExist, KeyError) as e:
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

        html = render_to_string( "s_groupListItem.html", {
            "g" : g
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
        print 'before member'
        member = Member.active.get(pk = request.session["member_id"])
        print "after member"
    except (Member.DoesNotExist, KeyError) as e:
        raise Http404()
    # Get the search query
    try:
        print 'before query'
        query = request.POST["query"]
        print "people search"
        fbAccessToken = request.POST["fbAccessToken"]
        print "accessToken: " + fbAccessToken
    except:
        print "except1: " + str(e)
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
    
    #fbUrl = "https://api.facebook.com/method/fql.query?query="
    #fbUrl = "https://graph.facebook.com/fql.query?query="
    fbUrl = "https://graph.facebook.com/fql?q="
    fbQuery = "SELECT uid, name, first_name, last_name, is_app_user, pic_square "
    fbQuery += "FROM user WHERE uid IN "
    fbQuery += "(SELECT uid2 FROM friend WHERE uid1=me()) "
    fbQuery += "AND is_app_user=0"
    if (len(query_split) == 1):
        fbQuery += str("AND (strpos(lower(first_name),'" + query_split[0] + "') == 0 ")
        fbQuery += str("OR strpos(lower(last_name), '" + query_split[0] + "') == 0)")
    elif (len(query_split) == 2):
        fbQuery += str("AND (strpos(lower(first_name),'" + query_split[0] + "') == 0 ")
        fbQuery += str("OR strpos(lower(last_name), '" + query_split[1] + "') == 0 ")
        fbQuery += str("OR strpos(lower(first_name), '" + query_split[1] + "') == 0 ")
        fbQuery += str("OR strpos(lower(last_name), '" + query_split[0] + "') == 0)")
    else:
        fbQuery = ""

    fbRequest = fbUrl + urllib2.quote(fbQuery) + "&access_token=" + fbAccessToken

    try:
        fbResponse = urllib2.urlopen(fbRequest).read()
    except Exception, e:
        print "except2: " + str(e)
    fbData = simplejson.loads(fbResponse)
    for fbFriend in fbData["data"]:
        print fbFriend["first_name"] + " " + fbFriend["last_name"]
        
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
    print "returning"
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

    # Get the inputted group or set the group to None if we are getting the "Not Grouped" members
    try:
        group = Group.objects.get(pk = request.POST["groupId"])
    except:
        group = None

    # Make sure the inputted group is one of the logged-in member's groups
    if ((group) and (group.creator != member)):
        raise Http404()

    # Get a list of the logged-in members friends
    friends = list(member.friends.all())
    friends.sort(key = lambda m : m.last_name) # TODO: try to remove this and just use a sencha sorter

    # Get only the "Not Grouped" members if necessary
    if (not group):
        for g in member.group_set.all():
            for m in g.members.all():
                if (m in friends):
                    friends.remove(m)

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
