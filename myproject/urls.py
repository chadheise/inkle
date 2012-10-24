#from django.conf.urls.defaults import patterns, include, url
from django.conf.urls.defaults import *
#from django.contrib.auth.views import login, logout
#from myproject import settings

# Uncomment the next two lines to enable the admin:
#from django.contrib import admin
#admin.autodiscover()

urlpatterns = patterns('',
    (r'^',  include('myproject.inkle.urls')),
    (r'^mobile/',  include('myproject.inkle.mobileUrls')),
    (r'^sencha/',  include('myproject.inkle.senchaUrls')),
    #(r'^facebook/', include('django_facebook.urls')),
    #(r'^accounts/', include('django_facebook.auth_urls')), #Don't add this line if you use django registration or userena for registration and auth.
)
