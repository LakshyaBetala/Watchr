import os

class Config:
    # Flask settings
    DEBUG = True
    PORT = int(os.environ.get('PORT', 5000))

    # IoT / Alert System target IP for alarms (ESP8266 etc.)
    ESP_IP = os.environ.get('ESP_IP', 'http://192.168.1.100')

    # Security & Analytics Thresholds
    CROWD_DENSITY_THRESHOLD = int(os.environ.get('CROWD_DENSITY_THRESHOLD', 50))
    DWELL_TIME_THRESHOLD = int(os.environ.get('DWELL_TIME_THRESHOLD', 300))
    
    # Fire & Safety Thresholds
    FIRE_CONFIDENCE_THRESHOLD = float(os.environ.get('FIRE_CONFIDENCE_THRESHOLD', 0.85))
    THERMAL_SPIKE_THRESHOLD = int(os.environ.get('THERMAL_SPIKE_THRESHOLD', 60)) # Celsius
    
    STORE_ID = "STR-001"
    
    # Supabase Credentials
    SUPABASE_URL = os.environ.get('SUPABASE_URL', 'https://jqybouilcscdjouueaum.supabase.co')
    SUPABASE_KEY = os.environ.get('SUPABASE_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxeWJvdWlsY3NjZGpvdXVlYXVtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDYwODE4NCwiZXhwIjoyMDkwMTg0MTg0fQ.UKx3PzJwHQ_oChm3LAnAxAVfAfzvQmUUq2ToMx8UCaE')
