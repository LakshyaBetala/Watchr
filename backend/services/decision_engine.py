from database.db import db
from services.alert_service import trigger_alert
from services.tracking_service import update_customer_tracking
from config import Config

def process_detection_event(ai_data):
    """
    Core brain: Receives AI payload, makes decisions, triggers alerts, and logs data.
    """
    theft_detected = ai_data.get("theft", False)
    unauthorized_zone = ai_data.get("unauthorized_access", False)
    people_count = ai_data.get("people_count", 0)
    tracked_ids = ai_data.get("tracked_ids", [])
    
    # New Modules
    fire_detected = ai_data.get("fire", False)
    thermal_temp = ai_data.get("thermal_temp", 25)
    cross_sell = ai_data.get("cross_sell_opportunity", False)
    clip_url = ai_data.get("clip_url", "http://camera-node.local/clip.mp4")
    
    # 1. Provide Tracking & Unattended Logic
    if tracked_ids:
        update_customer_tracking(tracked_ids)
        
        # Check if anyone has been standing around for 5+ minutes!
        for cid in tracked_ids:
            c_data = db.customers.get(str(cid), {})
            if c_data.get("dwell_time", 0) > Config.UNATTENDED_TIME_THRESHOLD:
                # Dispatch Unattended Alert instantly!
                unat_details = {"customer_id": cid, "wait_time_secs": c_data.get("dwell_time")}
                db.add_log("CUSTOMER_UNATTENDED", unat_details)
                trigger_alert("CUSTOMER_UNATTENDED", unat_details)
        
    # 2. Priority Event Pipeline
    event = "SAFE"
    details = {}
    
    if fire_detected:
        event = "FIRE_DETECTED"
        details = {
            "confidence": ai_data.get("confidence", 0.99), 
            "type": "visual", 
            "clip_url": clip_url,
            "people_details": ai_data.get("people_details", "No specific people details available.")
        }
    elif thermal_temp > Config.THERMAL_SPIKE_THRESHOLD:
        event = "THERMAL_ALERT"
        details = {
            "temperature": thermal_temp, 
            "sensor": "ESP32", 
            "clip_url": clip_url,
            "people_details": ai_data.get("people_details", "Therma-spike detected in populated zone.")
        }
    elif theft_detected:
        event = "THEFT_DETECTED"
        details = {"confidence": ai_data.get("confidence", 0.99)}
    elif cross_sell:
        event = "CROSS_SELL_OPPORTUNITY"
        details = {"target_ids": tracked_ids, "action": "Staff assistance recommended"}
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
        trigger_alert(event, details)
    elif db.current_status != "SAFE":
        trigger_alert("SAFE", {})
        
    return event
