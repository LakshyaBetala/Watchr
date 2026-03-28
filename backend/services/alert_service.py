import requests
import time
from config import Config

last_trigger_time = 0

def trigger_alert(event_type):
    """
    Ping the IoT edge device (like ESP8266 or alarms).
    """
    global last_trigger_time
    
    # Debounce spamming triggers
    if time.time() - last_trigger_time < 5:
        return
        
    last_trigger_time = time.time()
    
    try:
        if event_type == "SAFE":
            requests.get(f"{Config.ESP_IP}/safe", timeout=1)
            print("Alert -> SAFE generated successfully.")
        else:
            requests.get(f"{Config.ESP_IP}/alert", params={"type": event_type}, timeout=1)
            print(f"Alert -> {event_type} generated successfully.")
    except Exception as e:
        # Fallback if there's no actual device connected during the demo
        print(f"IoT Fallback - Event '{event_type}' logged successfully. Connection skipping ({e})")
