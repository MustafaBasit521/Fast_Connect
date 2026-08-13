import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from dotenv import load_dotenv

load_dotenv()

SMTP_HOST = os.getenv("SMTP_HOST")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASS = os.getenv("SMTP_PASS")
MAIL_FROM = os.getenv("MAIL_FROM", SMTP_USER)
MAIL_ENABLED = os.getenv("MAIL_ENABLED", "false").lower() == "true"

IS_SMTP_CONFIGURED = bool(SMTP_HOST and SMTP_USER and SMTP_PASS)


def send_email(to: str, subject: str, text: str, html: str | None = None):
    if not MAIL_ENABLED or not to:
        return

    if not IS_SMTP_CONFIGURED:
        print(f"[email:preview] to={to} subject={subject}\n{text}")
        return

    assert SMTP_HOST and SMTP_USER and SMTP_PASS and MAIL_FROM

    message = MIMEMultipart("alternative")
    message["From"] = MAIL_FROM
    message["To"] = to
    message["Subject"] = subject

    message.attach(MIMEText(text, "plain"))
    if html:
        message.attach(MIMEText(html, "html"))

    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASS)
            server.sendmail(MAIL_FROM, to, message.as_string())
    except Exception as e:
        print(f"Email delivery failed: {e}")


def send_welcome_email(user_name: str, user_email: str):
    send_email(
        to=user_email,
        subject="Welcome to FAST Connect",
        text=f"Hi {user_name}, your FAST Connect account has been created successfully.",
        html=f"<p>Hi <strong>{user_name}</strong>, your FAST Connect account has been created successfully.</p>",
    )


def send_friend_request_email(to_email: str, to_name: str, from_name: str):
    send_email(
        to=to_email,
        subject=f"{from_name} sent you a friend request",
        text=f"Hi {to_name}, {from_name} sent you a friend request on FAST Connect.",
        html=f"<p>Hi <strong>{to_name}</strong>, <strong>{from_name}</strong> sent you a friend request on FAST Connect.</p>",
    )


def send_new_follower_email(to_email: str, to_name: str, from_name: str):
    send_email(
        to=to_email,
        subject=f"{from_name} started following you",
        text=f"Hi {to_name}, {from_name} started following you on FAST Connect.",
        html=f"<p>Hi <strong>{to_name}</strong>, <strong>{from_name}</strong> started following you on FAST Connect.</p>",
    )


def send_new_message_email(to_email: str, to_name: str, from_name: str):
    send_email(
        to=to_email,
        subject=f"New message from {from_name}",
        text=f"Hi {to_name}, you have a new message from {from_name} on FAST Connect.",
        html=f"<p>Hi <strong>{to_name}</strong>, you have a new message from <strong>{from_name}</strong> on FAST Connect.</p>",
    )


def send_password_reset_email(to_email: str, to_name: str, reset_token: str):
    send_email(
        to=to_email,
        subject="Reset your FAST Connect password",
        text=f"Hi {to_name}, use this token to reset your password: {reset_token}",
        html=f"<p>Hi <strong>{to_name}</strong>, use this token to reset your password: <strong>{reset_token}</strong></p>",
    )


FRONTEND_URL = os.getenv("FRONTEND_URL", "https://fast-connect-frontend-three.vercel.app")


def send_verification_email(to_email: str, to_name: str, verification_token: str):
    link = f"{FRONTEND_URL}/verify-email?token={verification_token}"
    send_email(
        to=to_email,
        subject="Verify your FAST Connect email",
        text=f"Hi {to_name}, please verify your email by visiting this link: {link}",
        html=f"<p>Hi <strong>{to_name}</strong>, please verify your email by clicking below:</p><p><a href=\"{link}\">Verify my email</a></p>",
    )
