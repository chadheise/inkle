from django.conf.urls.defaults import *
from django.views.generic.simple import direct_to_template
#from django.contrib.auth.views import login, logout

# Uncomment the next two lines to enable the admin:
#from django.contrib import admin
#admin.autodiscover()

urlpatterns = patterns(
    "myproject.inkle.senchaViews",
    (r"^isLoggedIn/$", "s_is_logged_in"),
    (r"^login/$", "s_login_view"),
    (r"^logout/$", "s_logout_view"),
    (r"^blots/$", "s_blots_view"),
    (r"^allInklings/$", "s_all_inklings_view"),
    (r"^inkling/$", "s_inkling_view"),
    (r"^inklingFeed/$", "s_inkling_feed_view"),
    (r"^postNewComment/$", "s_post_new_comment_view"),
    (r"^myInklings/$", "s_my_inklings_view"),
    (r"^profile/$", "s_profile_view"),
)
