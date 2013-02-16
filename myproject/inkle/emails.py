from smtplib import SMTP_SSL
from email.mime.text import MIMEText

from myproject.settings import DEBUG, SEND_EMAILS_AS_HTML


def send_email(from_address, to_addresses, subject, body_text, body_html):
    """Sends an email with the inputted details using the WebFaction SMTP server."""
    # Determine the email's format
    if (SEND_EMAILS_AS_HTML):
        message = MIMEText(body_html, "html")
    else:
        message = MIMEText(body_text)

    # Set the email's header
    message["Subject"] = subject
    if (DEBUG):
        to_addresses = ["test@inkleit.com"]
    message["To"] = to_addresses[0]
    message["From"] = from_address

    # Connect to the server, send the email, and disconnect from the server
    server = SMTP_SSL("smtp.webfaction.com", 465)

    server.login("inkle", "AmiTabh-2012")

    server.sendmail(from_address, to_addresses, message.as_string())

    server.quit()


def send_password_reset_email(user):
    """Sends an email with a PIN which allows member to reset their password."""
    # Specify the from address and to addresses
    from_address = "inkle@inkleit.com"
    to_addresses = [user.email]

    # Specify the subject
    subject = "Reset your Inkle password"

    # Specify the text body
    body_text = """Hi %s,

        We hear you forgot the password to your Inkle account! You can easily reset it by typing the PIN below into the app:

        %d

        If you didn't request to have your password reset, don't worry - just disregard this message.

    Thanks,
    The Inkle team""" % (user.first_name, user.get_profile().password_reset_pin)

    # Specify the HTML body
    body_html = """<html>
        <head><head>
        <body>
            <p>Hi %s,</p>

            <p>We hear you forgot the password to your Inkle account! You can easily reset it by typing the PIN below into the app:</p>

            <p>%d</p>

            <p>If you didn't request to have you password reset, don't worry - just disregard this message.</p>

            <p>Thanks,<br />
            The Inkle team</p>
        </body>
    </html>""" % (user.first_name, user.get_profile().password_reset_pin)

    # Send the email
    send_email(from_address, to_addresses, subject, body_text, body_html)
