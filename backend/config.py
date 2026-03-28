import os

class Config:
    # Flask settings
    DEBUG = True
    PORT = int(os.environ.get('PORT', 5050))

    # IoT / Alert System target IP for alarms (ESP8266 etc.)
    ESP_IP = os.environ.get('ESP_IP', 'http://192.168.1.100')

    # Security & Analytics Thresholds
    CROWD_DENSITY_THRESHOLD = int(os.environ.get('CROWD_DENSITY_THRESHOLD', 50))
    DWELL_TIME_THRESHOLD = int(os.environ.get('DWELL_TIME_THRESHOLD', 300))
    
    # Fire & Safety Thresholds
    FIRE_CONFIDENCE_THRESHOLD = float(os.environ.get('FIRE_CONFIDENCE_THRESHOLD', 0.85))
    THERMAL_SPIKE_THRESHOLD = int(os.environ.get('THERMAL_SPIKE_THRESHOLD', 60)) # Celsius
    
    # Customer Service Thresholds
    UNATTENDED_TIME_THRESHOLD = int(os.environ.get('UNATTENDED_TIME_THRESHOLD', 300)) # 5 mins in seconds
    
    STORE_ID = "STR-001"
    
    # Supabase Credentials
    SUPABASE_URL = os.environ.get('SUPABASE_URL', '')
    SUPABASE_KEY = os.environ.get('SUPABASE_KEY', '')

    # Email / Twilio SendGrid settings
    MAIL_SENDER = 'gkavin446@gmail.com'
    FIRE_STATION_EMAIL = 'gkavin583@gmail.com'
    SENDGRID_API_KEY = os.environ.get('SENDGRID_API_KEY', '')

    # Emergency SMTP Backup (If SendGrid is Deferred)
    USE_SMTP = True 
    SMTP_SERVER = "smtp.gmail.com"
    SMTP_PORT = 587
    GMAIL_APP_PASSWORD = os.environ.get('GMAIL_APP_PASSWORD', '')
