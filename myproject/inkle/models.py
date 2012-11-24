from django.db import models
from django.contrib.auth.models import User

#from django_facebook.models import FacebookProfileModel

from datetime import date

class Group(models.Model):
    """Group class definition."""
    # General information
    creator = models.ForeignKey("Member")
    name = models.CharField(max_length = 50)
    members = models.ManyToManyField("Member", related_name = "groups_member_of")

    # Metadata
    date_created = models.DateTimeField(auto_now_add = True)
    date_name_last_modified = models.DateTimeField(blank = True, null = True)
    date_members_last_modified = models.DateTimeField(blank = True, null = True)
    
    # Class methods
    def __unicode__(self):
        """String representation for the current group."""
        return "%d: %s (%s)" % (self.id, self.name, self.creator.get_full_name())


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
            dateNum = self.updated_to.split()[-1] #Get the last part of the update which contains the date number
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
    allow_sharing = models.BooleanField()
    shared_with = models.ManyToManyField("Member", related_name = "inklings_shared_with")
    
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

    def get_attendees(self):
        """Returns a list of all the members attending the current inkling."""
        return self.member_set.all()

    def get_num_attendees(self):
        """Returns the number of members attending the current inkling."""
        return self.member_set.count()

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


class ActiveMemberManager(models.Manager):
    """Manager which returns active Member objects."""
    def get_query_set(self):
        return Member.objects.filter(is_active = True)


#class Member(FacebookProfileModel):
class Member(User):
    """Member class definition. Uses the following from the built-in Django User class:
       id, username, password, first_name, last_name, email, is_staff, is_active, is_superuser, last_login, and date_joined"""
    #user = models.OneToOneField(User)
    
    # General information
    gender = models.CharField(max_length = 1, choices=(('m', 'Male'), ('f', 'Female')), blank = True, null = True)
    birthday = models.DateField()
    facebookId = models.BigIntegerField(blank = True, null = True, unique = True)
    
    # Friends
    friends = models.ManyToManyField("self")
    
    # Inklings
    inklings = models.ManyToManyField(Inkling)

    # Managers
    objects = models.Manager()
    active = ActiveMemberManager()

    # Metadata
    date_last_modified = models.DateTimeField(auto_now = True)

    # Class methods
    def __unicode__(self):
        """String representation for the current member."""
        return "%d: %s" % (self.id, self.get_full_name())

    def get_full_name(self):
        """Returns the current member's full name."""
        return "%s %s" % (self.first_name, self.last_name)

    def get_num_mutual_friends(self, m):
        """Returns the number of mutual friends the current member has with the inputted member."""
        return len(self.friends.filter(is_active = True) & m.friends.filter(is_active = True))

    def has_pending_friend_request_to(self, m):
        """Returns True if the current memeber has a pending friend request to the inputted member."""
        return bool(FriendRequest.objects.filter(sender = self, receiver = m, status = "pending"))

    def get_picture_path(self, m):
        """Returns the path to the member's picture"""
        #"file:///Users/wengrfam/Desktop/inkle/myproject/inkle/static/media/images/members/{{ m.id }}.jpg"
        return "file:///Users/chadheise/Sites/inkle/www/resources/images/feed/man.jpg"
