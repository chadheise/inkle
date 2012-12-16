from django import template
from django.template.defaultfilters import stringfilter

register = template.Library()

@register.filter()
@stringfilter
def truncate_characters(value, arg):
    """Truncates a string after a certain number of characters."""
    # Get the number of chars to truncate after (or fail silently if it is not an int)
    try:
        length = int(arg)
    except ValueError:
        return value

    # Add an ellipse if applicable, otherwise, simply return the input value
    if len(value) > length:
        return "%s..." % (value[0:(length - 3)]).strip()
    return value
truncate_characters.is_safe = True
