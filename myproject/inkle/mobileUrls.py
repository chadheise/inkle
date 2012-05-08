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
    (r"^location/$", "m_location_view"),
    (r"^getInvitations/$", "m_get_invitations_view"),
    (r"^invitationResponse/$", "m_invitation_response_view"),
    (r"^getPeopleGroups/(?P<people_type>blots|networks)/$", "m_get_people_groups"),
    (r"^getMyInklings/$", "m_get_my_inklings_view"),
    (r"^setMyInkling/$", "m_set_my_inkling_view"),
    (r"^suggestions/location/$", "m_location_suggestions_view"),
    (r"^suggestions/invitee/$", "m_invitee_suggestions_view"),
    (r"^createInkling/$", "m_create_inkling_view"),
    (r"^removeInkling/$", "m_remove_inkling_view"),
    
    (r"^inklingInvitations/$", "m_inkling_invitations_view"),
    (r"^sendInklingInvitations/$", "m_send_inkling_invitations_view"),
    
    #(r"^image/location/(?P<location_type>location|place)/(?P<location_id>\d+)/$", "m_image_location"),
)
