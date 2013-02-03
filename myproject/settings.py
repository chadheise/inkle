# DEBUG and TEMPLATE_DEBUG are True if in devlopment; False if in production
DEBUG = True
TEMPLATE_DEBUG = DEBUG

# People who receive error reports when a view raises an exception
if (not DEBUG):
    ADMINS = (
        ("Inkle Errors", "errors@inkleit.com"),
    )

# People who receive broken link notifications
if (not DEBUG):
    MANAGERS = ADMINS

# Databases
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",     # Add "postgresql_psycopg2", "postgresql", "mysql", "sqlite3" or "oracle"
        "NAME": "inkle_db",                         # Or path to database file if using sqlite3
        "USER": "",                                 # Not used with sqlite3
        "PASSWORD": "",                             # Not used with sqlite3
        "HOST": "",                                 # Set to empty string for localhost; not used with sqlite3
        "PORT": "",                                 # Set to empty string for default; not used with sqlite3
    }
}

# Local time zone for this installation. Choices can be found here:
# http://en.wikipedia.org/wiki/List_of_tz_zones_by_name
# although not all choices may be available on all operating systems.
# On Unix systems, a value of None will cause Django to use the same
# timezone as the operating system.
# If running in a Windows environment this must be set to the same as your
# system time zone.
#TIME_ZONE = "America/New_York"
#TIME_ZONE = "America/Los_Angeles"
TIME_ZONE = "UTC"

# Language
# All choices here: http://www.i18nguy.com/unicode/language-identifiers.html
LANGUAGE_CODE = "en-us"

SITE_ID = 1

# If you set this to False, Django will make some optimizations so as not to load the internationalization machinery
USE_I18N = True

# If you set this to False, Django will not format dates, numbers and calendars according to the current locale
USE_L10N = True

# Absolute filesystem path to the directory that will hold user-uploaded files
# Example: "/home/media/media.lawrence.com/media/"
MEDIA_ROOT = "/Users/wengrfam/Desktop/inkle/myproject/static/media/"

# URL that handles the media served from MEDIA_ROOT; make sure to use a trailing slash
# Examples: "http://media.lawrence.com/media/", "http://example.com/media/"
MEDIA_URL = "http://127.0.0.1:8000/static/media/"

# Absolute path to the directory static files should be collected to
# Don't put anything in this directory yourself; store your static files in apps' "static/" subdirectories and in STATICFILES_DIRS.
# Example: "/home/media/media.lawrence.com/static/"
STATIC_ROOT = "/Users/wengrfam/Desktop/inkle/myproject/static/"

# URL prefix for static files
# Example: "http://media.lawrence.com/static/"
STATIC_URL = "/static/"

# URL prefix for admin static files -- CSS, JavaScript and images; make sure to use a trailing slash.
# Examples: "http://foo.com/static/admin/", "/static/admin/"
ADMIN_MEDIA_PREFIX = "/static/admin/"

# Additional locations of static files
STATICFILES_DIRS = (
    # Put strings here, like "/home/html/static" or "C:/www/django/static".
    # Always use forward slashes, even on Windows.
    # Don't forget to use absolute paths, not relative paths.
)

# List of finder classes that know how to find static files in
# various locations.
STATICFILES_FINDERS = (
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',
#    'django.contrib.staticfiles.finders.DefaultStorageFinder',
)

# Make this unique, and don't share it with anybody.
SECRET_KEY = ')a+75+hlc}&i6^r1ip!nd@)r_5+f)c-^ba5-wxu-=3t5oy*d9o'

# List of callables that know how to import templates from various sources.
TEMPLATE_LOADERS = (
    'django.template.loaders.filesystem.Loader',
    'django.template.loaders.app_directories.Loader',
#     'django.template.loaders.eggs.Loader',
)

MIDDLEWARE_CLASSES = (
    'django.middleware.common.CommonMiddleware',
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
)

ROOT_URLCONF = "myproject.urls"

TEMPLATE_DIRS = (
    # Put strings here, like "/home/html/django_templates" or "C:/www/django/templates".
    # Always use forward slashes, even on Windows.
    # Don't forget to use absolute paths, not relative paths.
    '/templates',
    '/inkle/templates',
)

INSTALLED_APPS = (
    "django.contrib.auth",
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.sites',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # Uncomment the next line to enable the admin:
    #'django.contrib.admin',
    # Uncomment the next line to enable admin documentation:
    #'django.contrib.admindocs',
    'inkle',
    #'south',
    'django.contrib.humanize',
    #'django_facebook',
)

# A sample logging configuration. The only tangible logging
# performed by this configuration is to send an email to
# the site admins on every HTTP 500 error.
# See http://docs.djangoproject.com/en/dev/topics/logging for
# more details on how to customize your logging configuration.
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {
        "mail_admins": {
            "level": "ERROR",
            "class": "django.utils.log.AdminEmailHandler"
        }
    },
    "loggers": {
        "django.request": {
            "handlers": ["mail_admins"],
            "level": "ERROR",
            "propagate": True,
        },
    }
}

# User authentication
AUTH_PROFILE_MODULE = "inkle.UserProfile"
LOGIN_URL = "/raise404/"

# TODO: get rid of this?
#Added for Django_facebook integration
"""
FACEBOOK_APP_ID = 355653434520396
FACEBOOK_APP_SECRET = "	e6df96d1801e704fecd7cb3fea71b944"

TEMPLATE_CONTEXT_PROCESSORS = (
    'django_facebook.context_processors.facebook',
    'django.contrib.auth.context_processors.auth',
    'django.core.context_processors.debug',
    'django.core.context_processors.i18n',
    'django.core.context_processors.media',
    'django.core.context_processors.static',
    'django.core.context_processors.tz',
    'django.contrib.messages.context_processors.messages',
)

AUTHENTICATION_BACKENDS = (
    'django_facebook.auth_backends.FacebookBackend',
    'django.contrib.auth.backends.ModelBackend',
) """
