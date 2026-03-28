from database.db import db

def update_customer_tracking(detected_ids):
    """
    Pulls tracking IDs array from the AI edge device payload and safely sends to Supabase.
    """
    for pid in detected_ids:
        pid_str = str(pid)
        # We delegate the entire database handling to the new Supabase logic
        db.upsert_customer(pid_str, "ACTIVE")

def get_customer_analytics():
    """
    Aggregates all active customer sessions for the frontend Dashboard.
    Reads from the local cache layer for speed instead of spamming Supabase selects.
    """
    active_customers = [c for c in db.customers.values() if c["status"] == "ACTIVE"]
    return {
        "total_unique_visitors": len(db.customers),
        "current_active_count": len(active_customers),
        "tracking_logs": active_customers
    }
