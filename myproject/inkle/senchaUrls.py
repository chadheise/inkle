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
    (r"^allInklings/$", "s_all_inklings_view"),
    (r"^isMemberInkling/$", "s_is_member_inkling_view"),
    (r"^inkling/$", "s_inkling_view"),
    (r"^editInkling/$", "s_edit_inkling_view"),
    (r"^saveInkling/$", "s_save_inkling_view"),
    (r"^joinInkling/$", "s_join_inkling_view"),
    (r"^inklingFeed/$", "s_inkling_feed_view"),
    (r"^postNewComment/$", "s_post_new_comment_view"),
    (r"^myInklings/$", "s_my_inklings_view"),
    (r"^friends/$", "s_friends_view"),
    (r"^blots/$", "s_blots_view"),
    (r"^sharing/$", "s_sharing_view"),
    (r"^profile/$", "s_profile_view"),
    (r"^peopleSearch/$", "s_people_search_view"),
    (r"^addFriend/$", "s_add_friend_view"),
    (r"^removeFriend/$", "s_remove_friend_view"),
    (r"^deleteBlot/$", "s_delete_blot_view"),
)
