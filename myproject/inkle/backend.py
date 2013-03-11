from inkle.models import Member
import urllib2


class FacebookAuthenticationBackend:
    """Authenticates users who are logged in through their Facebook account."""
    def authenticate(self, facebook_id = None, facebook_access_token = None):
        try:
            member = Member.objects.get(facebook_id = facebook_id)

            # The following will throw an exception if Facebook cannot validate the access token
            urllib2.urlopen("https://graph.facebook.com/me?access_token=" + facebook_access_token).read()
        except:
            member = None

        return member

    def get_user(self, member_id):
        try:
            return Member.objects.get(pk = member_id)
        except Member.DoesNotExist:
            return None