from django.conf.urls.defaults import *
from django.views.generic.simple import direct_to_template
#from django.contrib.auth.views import login, logout

# Uncomment the next two lines to enable the admin:
#from django.contrib import admin
#admin.autodiscover()

urlpatterns = patterns(
    "myproject.inkle.mobileViews",
    (r"^login/$", "m_login_view"),
    (r"^test/$", "m_test_view"),
    (r"^othersInklings/$", "m_get_others_inklings_view"),
    (r"^getInvitations/$", "m_get_invitations_view"),
    (r"^invitationResponse/$", "m_invitation_response_view"),
    #(r"^image/location/(?P<location_type>location|place)/(?P<location_id>\d+)/$", "m_image_location"),
)
