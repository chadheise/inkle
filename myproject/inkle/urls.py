from django.conf.urls import *
#from django.contrib.auth.views import login, logout

# Uncomment the next two lines to enable the admin:
#from django.contrib import admin
#admin.autodiscover()

urlpatterns = patterns(
    "myproject.inkle.views",

    (r"^getCsrfToken/$", "get_csrf_token_view"),
    (r"^raise404/$", "raise_404_view"),

    # Login, logout, and registration
    (r"^isLoggedIn/$", "is_logged_in"),
    (r"^emailLogin/$", "email_login_view"),
    (r"^facebookLogin/$", "facebook_login_view"),
    (r"^logout/$", "logout_view"),
    (r"^forgottenPassword/$", "forgotten_password_view"),
    (r"^resetPassword/$", "reset_password_view"),
    (r"^registration/$", "registration_view"),
    (r"^linkFacebookAccount/$", "link_facebook_account_view"),

    # Common
    (r"^groups/$", "groups_view"),
    (r"^groupsMainContent/$", "groups_main_content_view"),
    (r"^groupsPanel/$", "groups_panel_view"),

    # All inklings
    (r"^allInklings/$", "all_inklings_view"),
    (r"^inkling/$", "inkling_view"),
    (r"^editInkling/$", "edit_inkling_view"),
    (r"^saveInkling/$", "save_inkling_view"),
    (r"^joinInkling/$", "join_inkling_view"),
    (r"^inklingFeed/$", "inkling_feed_view"),
    (r"^inklingMembersAttending/$", "inkling_members_attending_view"),
    (r"^inklingMembersAwaitingReply/$", "inkling_members_awaiting_reply_view"),
    (r"^addFeedComment/$", "add_feed_comment_view"),

    # My inklings
    (r"^myInklings/$", "my_inklings_view"),
    (r"^createInkling/$", "create_inkling_view"),
    (r"^updateInkling/$", "update_inkling_view"),
    (r"^numInklingInvitations/$", "num_inkling_invitations_view"),
    (r"^inklingInvitations/$", "inkling_invitations_view"),
    (r"^respondToInklingInvitation/$", "respond_to_inkling_invitation_view"),

    # Friends
    (r"^friends/$", "friends_view"),
    (r"^friendRequests/$", "friend_requests_view"),
    (r"^numFriendRequests/$", "num_friend_requests_view"),
    (r"^peopleSearch/$", "people_search_view"),
    (r"^addFriend/$", "add_friend_view"),
    (r"^respondToRequest/$", "respond_to_request_view"),
    (r"^revokeRequest/$", "revoke_request_view"),
    (r"^removeFriend/$", "remove_friend_view"),
    (r"^deleteGroup/$", "delete_group_view"),
    (r"^groupMembers/$", "group_members_view"),
    (r"^addToGroup/$", "add_to_group_view"),
    (r"^removeFromGroup/$", "remove_from_group_view"),
    (r"^createGroup/$", "create_group_view"),
    (r"^renameGroup/$", "rename_group_view"),

    # Settings
    (r"^shareSettingsForm/$", "share_settings_form_view"),
    (r"^setShareSetting/$", "set_share_setting_view"),
    (r"^changePassword/$", "change_password_view"),
    (r"^changeEmail/$", "change_email_view"),
    (r"^inviteFacebookFriendsView/$", "invite_facebook_friends_view"),
    (r"^facebookPost/$", "facebook_post"),
)
