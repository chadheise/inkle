from django.db import models
from django.contrib.auth.models import User

from hashlib import md5
from random import randint
#from PIL import Image

import datetime

from myproject.settings import MEDIA_ROOT

class Location(models.Model):
    """Location class definition."""
    # General information
    name = models.CharField(max_length = 100)

    def __unicode__(self):
        """String representation for the current location."""
        return "%s" % (self.name)


class Blot(models.Model):
    """Blot class definition."""
    # General information
    name = models.CharField(max_length = 50)
    members = models.ManyToManyField("Member")

    # Metadata
    date_created = models.DateTimeField(auto_now_add = True)
    date_last_modified = models.DateTimeField(auto_now = True)
    num_modifications = models.IntegerField(max_length = 4, default = 0)
    
    # Class methods
    def __unicode__(self):
        """String representation for the current blot."""
        return "%s" % (self.name)


class PastInklingManager(models.Manager):
    """Manager which returns past inkling objects."""
    def get_query_set(self):
        return Inkling.objects.filter(date__lt = datetime.date.today())


class CurrentInklingManager(models.Manager):
    """Manager which returns current inkling objects."""
    def get_query_set(self):
        return Inkling.objects.filter(date__gte = datetime.date.today())


class Inkling(models.Model):
    """Inkling class definition."""
    # General information
    location = models.ForeignKey(Location, blank = True, null = True)
    category = models.CharField(max_length = 30, blank = True)
    date = models.DateField()
    time = models.CharField(max_length = 15, blank = True)
    notes = models.CharField(max_length = 100, blank = True)
    is_private = models.BooleanField(default = False)

    # Managers
    objects = models.Manager()
    past = PastInklingManager()
    current = CurrentInklingManager()
    
    # Metadata
    date_created = models.DateTimeField(auto_now_add = True)
    date_last_modified = models.DateTimeField(auto_now = True)
    num_location_changes = models.IntegerField(max_length = 4, default = 0)
    num_category_changes = models.IntegerField(max_length = 4, default = 0)
    num_date_changes = models.IntegerField(max_length = 4, default = 0)
    num_time_changes = models.IntegerField(max_length = 4, default = 0)
    num_notes_changes = models.IntegerField(max_length = 4, default = 0)
    num_is_private_changes = models.IntegerField(max_length = 4, default = 0)

    # Class methods
    def __unicode__(self):
        """String representation for the current inkling."""
        return "%s (%s)" % (self.location.name, self.get_formatted_date())

    def get_attendees(self):
        return self.member_set.all()

    def get_num_attendees(self):
        return self.member_set.count()

    def get_formatted_date(self, year = True, weekday = False):
        """Returns the current inkling's formatted date."""
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


class ActiveMemberManager(models.Manager):
    """Manager which returns active member objects."""
    def get_query_set(self):
        return Member.objects.filter(is_active = True, verified = True)


class Member(User):
    """Member class definition. Inherits from built-in Django User class."""
    # Note: inherits from built-in Django User class which contains:
    #       id, username, password, first_name, last_name, email, is_staff, is_active, is_superuser, last_login, and date_joined
   
    # General information
    gender = models.CharField(max_length = 6)
    birthday = models.DateField()
    phone = models.CharField(max_length = 10, default = "")
    street = models.CharField(max_length = 100, default = "")
    city = models.CharField(max_length = 50, default = "")
    state = models.CharField(max_length = 2, default = "")
    zip_code = models.CharField(max_length = 5, default = "")
    
    # Lists
    blots = models.ManyToManyField(Blot)
    inklings = models.ManyToManyField(Inkling)

    # Member lists
    #pending = models.ManyToManyField("self", symmetrical = False, related_name = "pending_related")
    #accepted = models.ManyToManyField("self", symmetrical = False, related_name = "accepted_related")
    #requested = models.ManyToManyField("self", symmetrical = False, related_name = "requested_related")
    #followers = models.ManyToManyField("self", symmetrical = False, related_name = "followers_related")
    #following = models.ManyToManyField("self", symmetrical = False, related_name = "following_related")
    friends = models.ManyToManyField("self")
    

    # Email verification
    verification_hash = models.CharField(max_length = 32)
    verified = models.BooleanField(default = False)

    # Privacy settings
    name_privacy = models.IntegerField(max_length = 1, default = 0)
    image_privacy = models.IntegerField(max_length = 1, default = 0)
    email_privacy = models.IntegerField(max_length = 1, default = 1)
    phone_privacy = models.IntegerField(max_length = 1, default = 1)
    birthday_privacy = models.IntegerField(max_length = 1, default = 1)
    gender_privacy = models.IntegerField(max_length = 1, default = 0)
    location_privacy = models.IntegerField(max_length = 1, default = 1)
    followers_privacy = models.IntegerField(max_length = 1, default = 1)
    following_privacy = models.IntegerField(max_length = 1, default = 1)
    networks_privacy = models.IntegerField(max_length = 1, default = 1)
    inklings_privacy = models.IntegerField(max_length = 1, default = 1)
    place_privacy = models.IntegerField(max_length = 1, default = 1)
    invitations_privacy = models.IntegerField(max_length = 1, default = 1)
    
    # Email preferences
    requested_email_preference = models.BooleanField(default = True)
    accepted_email_preference = models.BooleanField(default = True)
    invited_email_preference = models.BooleanField(default = True)
    response_email_preference = models.BooleanField(default = True)
    general_email_preference = models.BooleanField(default = True)
    email_format_html = models.BooleanField(default = False)

    # Managers
    objects = models.Manager()
    active = ActiveMemberManager()
    
    # Metadata
    changed_image = models.IntegerField(max_length = 4, default = 0)
    changed_email_address = models.IntegerField(max_length = 4, default = 0)

    # Class methods
    def __unicode__(self):
        """String representation for the current member."""
        return "%s (%s %s)" % (self.email, self.first_name, self.last_name)

    def get_full_name(self):
        """Returns the current member's full name."""
        return "%s %s" % (self.first_name, self.last_name)

    def get_formatted_phone(self):
        """Returns the current member's formatted phone number."""
        return "(%s) %s-%s" % (self.phone[0:3], self.phone[3:6], self.phone[6:10])

    def get_formatted_birthday(self):
        """Returns the current member's formatted birthday."""
        months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
        return "%s %s, %s" % (months[self.birthday.month - 1], self.birthday.day, self.birthday.year)

    def update_verification_hash(self):
        """Updates the current member's verification hash."""
        self.verification_hash = md5(str(randint(1000, 9999))).hexdigest()

    def update_profile_information(self, first_name, last_name, phone, street, city, state, zip_code, birthday, gender):
        """Updates the current member's privacy settings."""
        self.first_name = first_name
        self.last_name = last_name
        self.phone = phone
        self.street = street
        self.city = city
        self.state = state
        self.zip_code = zip_code
        self.birthday = birthday
        self.gender = gender

    def update_privacy_settings(self, location, email, phone, birthday, followers, following, networks, place, inklings):
        """Updates the current member's privacy settings."""
        self.location_privacy = location
        self.email_privacy = email
        self.phone_privacy = phone
        self.birthday_privacy = birthday
        self.followers_privacy = followers
        self.following_privacy = following
        self.networks_privacy = networks
        self.place_privacy = place
        self.inklings_privacy = inklings

    def update_email_preferences(self, requested, accepted, invited, response, general):
        """Updates the current member's email preferences."""
        self.requested_email_preference = requested
        self.accepted_email_preference = accepted
        self.invited_email_preference = invited
        self.response_email_preference = response
        self.general_email_preference = general
