import time
import smtplib
import requests
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from config import Config

last_trigger_time = 0

def notify_firestation(details):
    """Sends an email alert to the fire station using SendGrid API"""
    clip = details.get("clip_url", "No Clip Available")
    people_details = details.get("people_details", "No specific people details available.")
    
    print(f"🚨 URGENT: Reporting incident to Fire Station at {Config.FIRE_STATION_EMAIL}")
    
    # SendGrid API Call (Simulated via requests)
    mail_data = {
        "personalizations": [{
            "to": [{"email": Config.FIRE_STATION_EMAIL}],
            "subject": f"🔥 URGENT: FIRE INCIDENT REPORT - {Config.STORE_ID}"
        }],
        "from": {"email": Config.MAIL_SENDER},
        "content": [
            {
                "type": "text/plain",
                "value": f"🚨 EMERGENCY: Fire Incident at {Config.STORE_ID}. Video: {clip}. People: {people_details}"
            },
            {
                "type": "text/html",
                "value": f"""
                <div style="font-family: sans-serif; border: 2px solid #ff4b2b; border-radius: 8px; padding: 20px; max-width: 600px;">
                    <h1 style="color: #ff4b2b; margin-top: 0;">🔥 EMERGENCY FIRE REPORT</h1>
                    <p style="font-size: 16px;"><b>Location:</b> Store {Config.STORE_ID}</p>
                    <p style="font-size: 16px;"><b>Reported Time:</b> {time.strftime('%Y-%m-%d %H:%M:%S UTC')}</p>
                    <hr style="border: 0; border-top: 1px solid #eee;">
                    <p style="font-size: 18px; color: #333;"><b>Victims/People in Zone:</b><br>{people_details}</p>
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; text-align: center; margin-top: 20px;">
                        <p style="margin-bottom: 15px;"><b>Live Camera Evidence</b></p>
                        <a href="{clip}" style="background: #ff4b2b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">WATCH CLIP NOW</a>
                    </div>
                    <p style="font-size: 12px; color: #666; margin-top: 30px;">This is an automated emergency report from <b>Watchr Smart Surveillance</b>.</p>
                </div>
                """
            }
        ]
    }
    
    # Try SMTP Backup first if SendGrid is slow
    if Config.USE_SMTP:
        try:
            print(f"📧 Sending via SMTP Backup (Gmail)...")
            msg = MIMEMultipart("alternative")
            msg["Subject"] = f"🔥 URGENT: FIRE INCIDENT REPORT - {Config.STORE_ID}"
            msg["From"] = Config.MAIL_SENDER
            msg["To"] = Config.FIRE_STATION_EMAIL
            
            # Use the same HTML content
            html_body = mail_data["content"][1]["value"]
            msg.attach(MIMEText(html_body, "html"))
            
            with smtplib.SMTP(Config.SMTP_SERVER, Config.SMTP_PORT) as server:
                server.starttls()
                server.login(Config.MAIL_SENDER, Config.GMAIL_APP_PASSWORD)
                server.sendmail(Config.MAIL_SENDER, Config.FIRE_STATION_EMAIL, msg.as_string())
            
            print(f"✅ SMTP Backup sent successfully to {Config.FIRE_STATION_EMAIL}!")
            return # Exit early if SMTP works
        except Exception as e:
            print(f"⚠️ SMTP Backup failed: {e}. Trying SendGrid...")

    try:
        # Live SendGrid (Twilio) API Call
        response = requests.post(
            "https://api.sendgrid.com/v3/mail/send",
            json=mail_data,
            headers={"Authorization": f"Bearer {Config.SENDGRID_API_KEY}"},
            timeout=5
        )
        if response.status_code == 202:
            print(f"✅ Fire Incident Report emailed successfully to {Config.FIRE_STATION_EMAIL}")
        else:
            print(f"⚠️ Mail service responded with status: {response.status_code}")
    except Exception as e:
        print(f"❌ Failed to send email alert: {e}")

def alert_staff_dashboard(alert_type, details):
    """Pushes a notification instantly to staff tablets or phones"""
    # In a real app, this could ping Firebase Cloud Messaging or Twilio SMS
    print(f"📱 STAFF PUSH NOTIFICATION SENT: {alert_type} | Details: {details}")

def trigger_alert(event_type, details=None):
    """
    Core Alert Dispatcher.
    Pings the physical IoT edge device and webhooks.
    """
    global last_trigger_time
    if details is None: 
        details = {}
    
    # 1. Advanced Software Webhooks (Always fires instantly)
    if event_type == "FIRE_DETECTED" or event_type == "THERMAL_ALERT":
        notify_firestation(details)
    elif event_type in ["THEFT_DETECTED", "CUSTOMER_UNATTENDED", "CROSS_SELL_OPPORTUNITY"]:
        alert_staff_dashboard(event_type, details)

    # 2. Hardware IoT Triggers (Debounced so physical alarms don't crash)
    if time.time() - last_trigger_time < 5:
        return
        
    last_trigger_time = time.time()
    try:
        if event_type == "SAFE":
            requests.get(f"{Config.ESP_IP}/safe", timeout=1)
        else:
            requests.get(f"{Config.ESP_IP}/alert", params={"type": event_type}, timeout=1)
    except Exception as e:
        pass
