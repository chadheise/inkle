from django.db import models
from django.contrib.auth.models import AbstractUser, UserManager

from datetime import date
from settings import STATIC_URL


class Group(models.Model):
    """Group class definition."""
    # General information
    creator = models.ForeignKey("Member")
    name = models.CharField(max_length = 50)
    members = models.ManyToManyField("Member", related_name = "groups_member_of")

    # Share with this group by default
    share_by_default = models.BooleanField(default=True)

    # Metadata
    date_created = models.DateTimeField(auto_now_add = True)
    date_name_last_modified = models.DateTimeField(blank = True, null = True)
    date_members_last_modified = models.DateTimeField(blank = True, null = True)

    # Class methods
    def __unicode__(self):
        """String representation for the current group."""
        return "%d: %s (%s)" % (self.id, self.name, self.creator.get_full_name())

    def get_member_ids(self):
        """Returns a comma separated list of the member IDs for the members in the current group."""
        member_ids = ""
        first = True
        for m in self.members.all():
            if (first):
                member_ids += str(m.id)
                first = False
            else:
                member_ids += "," + str(m.id)

        return member_ids


class FeedUpdate(models.Model):
    """FeedUpdate class definition."""
    # General information
    creator = models.ForeignKey("Member")
    inkling = models.ForeignKey("Inkling")
    update_type = models.CharField(max_length = 10)
    updated_to = models.CharField(max_length = 200)

    # Metadata
    date_created = models.DateTimeField(auto_now_add = True)

    # Class methods
    def __unicode__(self):
        """String representation for the current feed update."""
        return "%d: %d - %s (%s)" % (self.id, self.inkling.id, self.update_type, self.creator.get_full_name())

    def get_icon_name(self):
        """Returns the icon name for the current feed update."""
        if (self.update_type == "location"):
            return "/feed/location.jpg"
        elif (self.update_type == "date"):
            dateNum = self.updated_to.split()[-1]  #Get the last part of the update which contains the date number
            return "/feed/date" + dateNum + ".jpg"
        elif (self.update_type == "time"):
            return "/feed/clock.jpg"
        elif (self.update_type == "notes"):
            return "/feed/notes.jpg"

    def get_text(self):
        """Returns the text for the current feed update."""
        if (self.update_type == "location"):
            return "updated the location to %s." % (self.updated_to)
        elif (self.update_type == "date"):
            return "updated the date to %s." % (self.updated_to)
        elif (self.update_type == "time"):
            return "updated the time to %s." % (self.updated_to)
        elif (self.update_type == "notes"):
            return "updated the notes."


class FeedComment(models.Model):
    """FeedComment class definition."""
    # General information
    creator = models.ForeignKey("Member")
    inkling = models.ForeignKey("Inkling")
    text = models.CharField(max_length = 150)

    # Metadata
    date_created = models.DateTimeField(auto_now_add = True)

    # Class methods
    def __unicode__(self):
        """String representation for the current comment."""
        if (len(self.text) <= 20):
            return "%d: %d - %s (%s)" % (self.id, self.inkling.id, self.text[:20], self.creator.get_full_name())
        else:
            return "%d: %d - %s... (%s)" % (self.id, self.inkling.id, self.text[:17].strip(), self.creator.get_full_name())

class InklingInvitation(models.Model):
    """InklingInvitation class definition."""
    # General information
    sender = models.ForeignKey("Member", related_name = "inkling_invitations_sent")
    receiver = models.ForeignKey("Member", related_name = "inkling_invitations_received")
    inkling = models.ForeignKey("Inkling")
    status = models.CharField(max_length = 10, default = "pending")

    # Metadata
    date_created = models.DateTimeField(auto_now_add = True)
    date_responded = models.DateTimeField(blank = True, null = True)

    # Class methods
    def __unicode__(self):
        """String representation for the current inkling invitation."""
        return "%d: %d - %s (%s to %s)" % (self.id, self.inkling.id, self.status, self.sender.get_full_name(), self.receiver.get_full_name())


class SharingPermission(models.Model):
    """SharingPermission class definition."""
    # General information
    creator = models.ForeignKey("Member", related_name = "sharing_permissions_created")
    members = models.ManyToManyField("Member", related_name = "sharing_permissions_allowed", blank = True)
    inkling = models.ForeignKey("Inkling")

    # Metadata
    date_created = models.DateTimeField(auto_now_add = True)

    # Class methods
    def __unicode__(self):
        """String representation for the current sharing permission."""
        return "%d: %d (%s to %d)" % (self.id, self.inkling.id, self.creator.get_full_name(), self.members.count())


class PastInklingManager(models.Manager):
    """Manager which returns past Inkling objects."""
    def get_query_set(self):
        return Inkling.objects.filter(date__lt = date.today())


class CurrentInklingManager(models.Manager):
    """Manager which returns current Inkling objects."""
    def get_query_set(self):
        return Inkling.objects.filter(date__gte = date.today())


class Inkling(models.Model):
    """Inkling class definition."""
    # General information
    creator = models.ForeignKey("Member", related_name = "inklings_created")
    location = models.CharField(max_length = 50, blank = True)
    date = models.DateField(blank = True, null = True)
    time = models.CharField(max_length = 30, blank = True)
    notes = models.CharField(max_length = 200, blank = True)

    # Sharing
    allow_share_forwarding = models.BooleanField()

    # Managers
    objects = models.Manager()
    past = PastInklingManager()
    current = CurrentInklingManager()

    # Metadata
    date_created = models.DateTimeField(auto_now_add = True)
    date_last_modified = models.DateTimeField(auto_now = True)

    # Class methods
    def __unicode__(self):
        """String representation for the current inkling."""
        return "%d: %s, %s (%s)" % (self.id, self.get_location(), self.get_formatted_date(), self.creator.get_full_name())

    def get_location(self):
        """Returns the current inkling's location or "Location TBD" if no location is specified."""
        if (self.location):
            return self.location
        else:
            return "Location TBD"

    def get_formatted_date(self, year = True, weekday = False):
        """Returns the current inkling's formatted date or "Date Unknown" if no date is specified."""
        # Return the formatted date if it is specified
        if (self.date):
            months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
            if (weekday):
                days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
                if (year):
                    return "%s, %s %d, %d" % (days[self.date.weekday()], months[self.date.month - 1], self.date.day, self.date.year)
                else:
                    return "%s, %s %d" % (days[self.date.weekday()], months[self.date.month - 1], self.date.day)
            else:
                if (year):
                    return "%s %d, %d" % (months[self.date.month - 1], self.date.day, self.date.year)
                else:
                    return "%s %d" % (months[self.date.month - 1], self.date.day)

        # Otherwise, simply return "Date Unknown"
        else:
            return "Date Unknown"

    def get_members_attending(self):
        """Returns a list of all the members attending the current inkling."""
        members_attending = [m for m in self.member_set.all()]
        return members_attending

    def get_num_members_attending(self):
        """Returns the number of members attending the current inkling."""
        return self.member_set.count()

    def get_members_awaiting_reply(self):
        """Returns a list of all the members who have been invited but have not responded to the current inkling."""
        awaiting_reply = []
        for i in InklingInvitation.objects.filter(inkling = self, status = "pending"):
            awaiting_reply.append(i.receiver)
        return awaiting_reply

    def get_num_members_awaiting_reply(self):
        """Returns the number of members who have been invited but have not responded to the current inkling."""
        return InklingInvitation.objects.filter(inkling = self, status = "pending").count()

    def member_has_pending_invitation(self, m):
        """Returns True if the inputted member has a pending invitation to the current inkling or False otherwise."""
        return(bool(m.inkling_invitations_received.filter(inkling = self, status = "pending")))


class FriendRequest(models.Model):
    """FriendRequest class definition."""
    # General information
    sender = models.ForeignKey("Member", related_name = "friend_requests_sent")
    receiver = models.ForeignKey("Member", related_name = "friend_requests_received")
    status = models.CharField(max_length = 10, default = "pending")

    # Metadata
    date_created = models.DateTimeField(auto_now_add = True)
    date_responded = models.DateTimeField(blank = True, null = True)

    # Class methods
    def __unicode__(self):
        """String representation for the current friend request."""
        return "%d: %s (%s to %s)" % (self.id, self.status, self.sender.get_full_name(), self.receiver.get_full_name())


class Member(AbstractUser):
    """Member class definition which extends the built-in Django AbstractUser class:
       id, username, password, first_name, last_name, email, is_staff, is_active, is_superuser, last_login, and date_joined"""

    # General information
    gender = models.CharField(max_length = 1, choices=(("m", "Male"), ("f", "Female")), blank = True, null = True)
    birthday = models.DateField()
    facebook_id = models.BigIntegerField(blank = True, null = True, unique = True)

    # Friends
    friends = models.ManyToManyField("self", related_name = "user_friends")

    # Inklings
    inklings = models.ManyToManyField(Inkling)

    # Inkling default share settings
    share_with_selected_groups = models.BooleanField(default=True)
    allow_inkling_attendees_to_share = models.BooleanField(default=False)
    # Group share settings are part of the Group object

    # Password reset information
    password_reset_pin = models.IntegerField(default = -1)

    # Managers
    objects = UserManager()

    # Metadata
    date_last_modified = models.DateTimeField(auto_now = True)

    # Class methods
    def __unicode__(self):
        """String representation for the current member."""
        return "%d: %s" % (self.id, self.get_full_name())

    def is_facebook_member(self):
        """Returns True if the current member logged in using Facebook or False otherwise."""
        return (self.facebook_id is not None)

    def get_num_mutual_friends(self, m):
        """Returns the number of mutual friends the current member has with the inputted member."""
        return len(self.friends.filter(is_active = True) & m.friends.filter(is_active = True))

    def get_pending_friends(self):
        "Returns all the members the user has a pending request to"
        requests = FriendRequest.objects.filter(sender = self, status = "pending")
        return [r.receiver for r in requests]

    def has_pending_friend_request_to(self, m):
        """Returns True if the current memeber has a pending friend request to the inputted member."""
        return bool(FriendRequest.objects.filter(sender = self, receiver = m, status = "pending"))

    def get_friends_who_have_requested(self):
        "Returns all the users who have requested the user be their friend"
        requests = FriendRequest.objects.filter(receiver = self, status = "pending")
        return [r.sender for r in requests]

    def get_picture_path(self):
        """Returns the path to the current member's picture."""
        if (self.is_facebook_member()):
            return "https://graph.facebook.com/" + str(self.facebook_id) + "/picture"
        else:
            return "http://127.0.0.1:8000/static/media/images/members/" + str(self.id) + ".jpg"
