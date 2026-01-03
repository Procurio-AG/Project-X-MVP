import os
import resend
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("RESEND_API_KEY")
if api_key:
    resend.api_key = api_key

def send_welcome_email(name: str, email: str):
    if not api_key:
        print("⚠️ Email skipped: RESEND_API_KEY not set.")
        return

    try:
        html_content = f"""
        <div style="font-family: sans-serif; color: #333;">
            <h2>Hey {name},</h2>
            <p>Welcome to the <strong>Stryker</strong> community!</p>
            <p>Excited to have you with us. Stay tuned!</p>
            <p><strong>#LetsStrykeBig</strong></p>
            <br>
            <p>Regards,</p>
            <p><strong>Stryker Team</strong></p>
        </div>
        """

        params = {
            "from": "Stryker <onboarding@resend.dev>", 
            "to": [email],
            "subject": "Welcome to Stryker! 🚀",
            "html": html_content
        }

        email_id = resend.Emails.send(params)
        print(f"Email sent to {email}: {email_id}")

    except Exception as e:
        print(f"Failed to send email: {e}")