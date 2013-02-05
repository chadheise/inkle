from inkle.models import UserProfile
from django.contrib.auth.models import User

import urllib2


class FacebookAuthenticationBackend:
    """Authenticates users who are logged in through their Facebook accounts."""
    def authenticate(self, facebook_id = None, facebook_access_token = None):
        try:
            user_profile = UserProfile.objects.get(facebook_id = facebook_id)
            user = user_profile.user
            if (not user.is_active):
                user = None

            # The following will throw an exception if Facebook cannot validate the access token
            urllib2.urlopen("https://graph.facebook.com/me?access_token=" + facebook_access_token).read()
        except:
            user = None

        return user

    def get_user(self, user_id):
        try:
            return User.objects.filter(is_active = True).get(pk = user_id)
        except User.DoesNotExist:
            return None
