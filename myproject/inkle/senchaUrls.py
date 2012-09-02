from django.conf.urls.defaults import *
from django.views.generic.simple import direct_to_template
#from django.contrib.auth.views import login, logout

# Uncomment the next two lines to enable the admin:
#from django.contrib import admin
#admin.autodiscover()

urlpatterns = patterns(
    "myproject.inkle.senchaViews",

    # Login/logout
    (r"^isLoggedIn/$", "s_is_logged_in"),
    (r"^login/$", "s_login_view"),
    (r"^logout/$", "s_logout_view"),

    # Common
    (r"^groups/$", "s_groups_view"),
    
    # All Inklings
    (r"^allInklings/$", "s_all_inklings_view"),
    (r"^isMemberInkling/$", "s_is_member_inkling_view"),
    (r"^inkling/$", "s_inkling_view"),
    (r"^editInkling/$", "s_edit_inkling_view"),
    (r"^saveInkling/$", "s_save_inkling_view"),
    (r"^joinInkling/$", "s_join_inkling_view"),
    (r"^inklingFeed/$", "s_inkling_feed_view"),
    (r"^postNewComment/$", "s_post_new_comment_view"),
    
    (r"^myInklings/$", "s_my_inklings_view"),
    (r"^createInkling/$", "s_create_inkling_view"),
    (r"^updateInkling/$", "s_update_inkling_view"),
    (r"^numInvitedFriends/$", "s_num_invited_friends_view"),
    (r"^inklingInvitedFriends/$", "s_inkling_invited_friends_view"),
    (r"^inviteMember/$", "s_invite_member_view"),
    (r"^uninviteMember/$", "s_uninvite_member_view"),
    (r"^inviteGroup/$", "s_invite_group_view"),
    (r"^uninviteGroup/$", "s_uninvite_group_view"),
    (r"^numInklingInvites/$", "s_num_inkling_invites_view"),
    (r"^inklingInvites/$", "s_inkling_invites_view"),

    (r"^friendsViewGroups/$", "s_friends_view_groups_view"),

    (r"^friends/$", "s_friends_view"),
    (r"^friendRequests/$", "s_friend_requests_view"),
    (r"^numFriendRequests/$", "s_num_friend_requests_view"),
    (r"^peopleSearch/$", "s_people_search_view"),
    (r"^addFriend/$", "s_add_friend_view"),
    (r"^respondToRequest/$", "s_respond_to_request_view"),
    (r"^removeFriend/$", "s_remove_friend_view"),
    (r"^deleteGroup/$", "s_delete_group_view"),
    (r"^groupMembers/$", "s_group_members_view"),
    (r"^addToGroup/$", "s_add_to_group_view"),
    (r"^removeFromGroup/$", "s_remove_from_group_view"),
    (r"^createGroup/$", "s_create_group_view"),
    (r"^renameGroup/$", "s_rename_group_view"),

    (r"^profile/$", "s_profile_view"),
)
