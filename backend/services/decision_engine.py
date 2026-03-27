from database.db import db
from services.alert_service import trigger_alert
from services.tracking_service import update_customer_tracking
from config import Config

def process_detection_event(ai_data):
    """
    Core brain: Receives AI payload, makes a decision, triggers alerts, and logs data.
    """
    theft_detected = ai_data.get("theft", False)
    unauthorized_zone = ai_data.get("unauthorized_access", False)
    people_count = ai_data.get("people_count", 0)
    tracked_ids = ai_data.get("tracked_ids", [])
    fire_detected = ai_data.get("fire", False)
    thermal_temp = ai_data.get("thermal_temp", 25) # Default room temp
    
    # 1. Provide Tracking
    if tracked_ids:
        update_customer_tracking(tracked_ids)
        
    # 2. Safety Logic Rules
    event = "SAFE"
    details = {}
    
    if fire_detected:
        event = "FIRE_DETECTED"
        details = {"confidence": ai_data.get("confidence", 0.99), "type": "visual_smoke_flame"}
    elif thermal_temp > Config.THERMAL_SPIKE_THRESHOLD:
        event = "THERMAL_ALERT"
        details = {"temperature": thermal_temp, "sensor": "ESP32"}
    elif theft_detected:
        event = "THEFT_DETECTED"
        details = {"confidence": ai_data.get("confidence", 0.99)}
    elif unauthorized_zone:
        event = "UNAUTHORIZED_ACCESS"
        details = {"zone": ai_data.get("zone", "RESTRICTED")}
    elif people_count > Config.CROWD_DENSITY_THRESHOLD:
        event = "CROWD_DENSITY_WARNING"
        details = {"count": people_count}
        
    # 3. Handle state and alerts
    db.update_status(event, count=people_count)
    
    if event != "SAFE":
        db.add_log(event, details)
        trigger_alert(event)
    elif db.current_status != "SAFE":
        # Reset IoT alarms back to safe mode
        trigger_alert("SAFE")
        
    return event
