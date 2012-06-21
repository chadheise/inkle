from django.conf.urls.defaults import *
from django.views.generic.simple import direct_to_template
#from django.contrib.auth.views import login, logout

# Uncomment the next two lines to enable the admin:
#from django.contrib import admin
#admin.autodiscover()

urlpatterns = patterns(
    "myproject.inkle.senchaViews",
    (r"^login/$", "s_login_view"),
    (r"^getBlots/$", "s_get_blots_view"),
    (r"^getAllInklings/$", "s_get_all_inklings_view"),
    (r"^getInkling/$", "s_get_inkling_view"),
    (r"^getMyInklings/$", "s_get_my_inklings_view"),
)
