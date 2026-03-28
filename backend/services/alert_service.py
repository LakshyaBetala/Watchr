import time
import smtplib
import requests
import os
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
from config import Config

logger = logging.getLogger(__name__)

last_trigger_time = 0
alert_history = {}
DEDUP_WINDOW = 300
ESCALATION_THRESHOLD = 120

def notify_firestation(details):
    clip = details.get("clip_url", "No Clip Available")
    clip_path = details.get("absolute_clip_path", None)
    logger.warning(f"🚨 URGENT: Reporting fire incident to {Config.FIRE_STATION_EMAIL}")
    
    msg = MIMEMultipart("mixed")
    msg["Subject"] = f"🔥 URGENT: FIRE INCIDENT REPORT - Store {Config.STORE_ID}"
    msg["From"] = Config.MAIL_SENDER
    msg["To"] = Config.FIRE_STATION_EMAIL
    
    html_body = f"""
    <div style="font-family: sans-serif; border: 2px solid #ff4b2b; padding: 20px; max-width: 600px;">
        <h1 style="color: #ff4b2b;">🔥 EMERGENCY FIRE REPORT</h1>
        <p><b>Location:</b> Store {Config.STORE_ID}</p>
        <p><b>Time:</b> {time.strftime('%Y-%m-%d %H:%M:%S')}</p>
        <p><b>Confidence:</b> {details.get('confidence', 'N/A')}</p>
        <div style="background: #f8f9fa; padding: 15px; text-align: center; margin-top: 20px;">
            <p><b>Live Camera Evidence</b></p>
            <a href="{clip}" style="background: #ff4b2b; color: white; padding: 12px 24px; text-decoration: none;">WATCH CLIP NOW</a>
            <p style="font-size: 11px; margin-top: 10px; color: #555;">(Or watch the attached MP4 file at the bottom of this email!)</p>
        </div>
    </div>
    """
    msg.attach(MIMEText(html_body, "html"))
    
    if clip_path and os.path.exists(clip_path):
        try:
            with open(clip_path, "rb") as f:
                attachment = MIMEBase("application", "octet-stream")
                attachment.set_payload(f.read())
            encoders.encode_base64(attachment)
            attachment.add_header("Content-Disposition", f"attachment; filename={os.path.basename(clip_path)}")
            msg.attach(attachment)
            logger.info(f"📎 Video evidence attached: {clip_path}")
        except Exception as e:
            logger.error(f"Failed to attach video evidence: {e}")
            
    _send_email(msg)


def notify_theft(details):
    suspect_info = details.get("suspect_details", [])
    clip_path = details.get("absolute_clip_path", details.get("clip_url", None))
    clip_url = details.get("clip_url", "#")
    
    logger.warning(f"🚨 THEFT ALERT: Notifying store owner")
    
    msg = MIMEMultipart("mixed")
    msg["Subject"] = f"🚨 THEFT DETECTED - {Config.STORE_ID} - {time.strftime('%H:%M:%S')}"
    msg["From"] = Config.MAIL_SENDER
    msg["To"] = Config.FIRE_STATION_EMAIL
    
    suspect_html = ""
    for s in suspect_info:
        # Handle both dict-format suspects (from AI engine) and plain string descriptions
        if isinstance(s, dict):
            suspect_html += f"""
        <tr>
            <td style="padding: 8px; border: 1px solid #ddd;">ID: {s.get('id', 'N/A')}</td>
            <td style="padding: 8px; border: 1px solid #ddd;">{s.get('confidence', 0)*100:.0f}%</td>
            <td style="padding: 8px; border: 1px solid #ddd;">{'YES' if s.get('trajectory_anomaly') else 'NO'}</td>
            <td style="padding: 8px; border: 1px solid #ddd;">{'YES' if s.get('confidence_drop') else 'NO'}</td>
            <td style="padding: 8px; border: 1px solid #ddd;">{' → '.join(s.get('zone_path', [])[-5:])}</td>
        </tr>
        """
        else:
            # Plain string description — render as a single full-width row
            suspect_html += f"""
        <tr>
            <td colspan="5" style="padding: 8px; border: 1px solid #ddd;">{s}</td>
        </tr>
        """
    
    html_body = f"""
    <div style="font-family: sans-serif; border: 2px solid #e74c3c; padding: 20px; max-width: 700px;">
        <h1 style="color: #e74c3c;">🚨 THEFT INCIDENT REPORT</h1>
        <p><b>Location:</b> Store {Config.STORE_ID}</p>
        <p><b>Time:</b> {time.strftime('%Y-%m-%d %H:%M:%S')}</p>
        <table style="border-collapse: collapse; width: 100%;">
            <tr style="background: #f8f9fa;">
                <th style="padding: 8px; border: 1px solid #ddd;">Suspect</th>
                <th style="padding: 8px; border: 1px solid #ddd;">Confidence</th>
                <th style="padding: 8px; border: 1px solid #ddd;">Skipped Billing</th>
                <th style="padding: 8px; border: 1px solid #ddd;">Conf Drop</th>
                <th style="padding: 8px; border: 1px solid #ddd;">Zone Path</th>
            </tr>
            {suspect_html}
        </table>
        <div style="background: #f8f9fa; padding: 15px; text-align: center; margin-top: 20px;">
            <p><b>Video Evidence</b></p>
            <a href="{clip_url}" style="background: #e74c3c; color: white; padding: 12px 24px; text-decoration: none;">WATCH THEFT CLIP</a>
        </div>
    </div>
    """
    msg.attach(MIMEText(html_body, "html"))
    
    if clip_path and os.path.exists(clip_path):
        try:
            with open(clip_path, "rb") as f:
                attachment = MIMEBase("application", "octet-stream")
                attachment.set_payload(f.read())
            encoders.encode_base64(attachment)
            attachment.add_header("Content-Disposition", f"attachment; filename={os.path.basename(clip_path)}")
            msg.attach(attachment)
            logger.info(f"📎 Video evidence attached: {clip_path}")
        except Exception as e:
            logger.error(f"Failed to attach video evidence: {e}")
    
    _send_email(msg)


def _send_email(msg):
    if not Config.GMAIL_APP_PASSWORD:
        logger.warning("⚠️ GMAIL_APP_PASSWORD not set. Email alert skipped.")
        return
    try:
        with smtplib.SMTP(Config.SMTP_SERVER, Config.SMTP_PORT) as server:
            server.starttls()
            server.login(Config.MAIL_SENDER, Config.GMAIL_APP_PASSWORD)
            server.sendmail(Config.MAIL_SENDER, msg["To"], msg.as_string())
        logger.info(f"✅ Email sent to {msg['To']}")
    except Exception as e:
        logger.error(f"❌ Email failed: {e}")


def alert_staff_dashboard(alert_type, details):
    logger.info(f"📱 STAFF NOTIFICATION: {alert_type} | {details}")


def trigger_alert(event_type, details=None):
    global last_trigger_time
    if details is None: details = {}
    now = time.time()
    
    last_alert_time = alert_history.get(event_type, 0)
    if now - last_alert_time < DEDUP_WINDOW:
        if now - last_alert_time > ESCALATION_THRESHOLD:
            logger.warning(f"⬆️ ESCALATING: {event_type} persisting")
        else:
            return
            
    alert_history[event_type] = now
    
    if event_type == "FIRE_DETECTED" or event_type == "THERMAL_ALERT":
        notify_firestation(details)
    elif event_type == "THEFT_DETECTED":
        notify_theft(details)
    elif event_type in ["CUSTOMER_UNATTENDED", "CROSS_SELL_OPPORTUNITY"]:
        alert_staff_dashboard(event_type, details)

    if now - last_trigger_time < 5: return
    last_trigger_time = now
    
    try:
        if event_type == "SAFE": requests.get(f"{Config.ESP_IP}/safe", timeout=1)
        else: requests.get(f"{Config.ESP_IP}/alert", params={"type": event_type}, timeout=1)
    except Exception:
        pass
