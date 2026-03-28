from datetime import datetime
from supabase import create_client, Client
from config import Config

class Database:
    def __init__(self):
        # 1. Connect securely to Supabase
        self.client: Client = create_client(Config.SUPABASE_URL, Config.SUPABASE_KEY)
        
        # 2. Local memory cache for ultra-fast analytics and non-critical dashboard flags
        self.customers = {}
        self.current_status = "SAFE"
        self.people_count = 0

    def add_log(self, event_type, details):
        log_entry = {
            "event": event_type,
            "details": details,
            "time": datetime.utcnow().isoformat()
        }
        try:
            # Pushes the alert directly to Supabase logs table forever!
            self.client.table("logs").insert(log_entry).execute()
            print(f"✅ Supabase Saved: {event_type}")
        except Exception as e:
            print(f"❌ Supabase Log Error: {e}")
            
        return log_entry

    def get_logs(self, limit=50):
        try:
            # Now queries your real database instead of memory
            response = self.client.table("logs").select("*").order("time", desc=True).limit(limit).execute()
            return response.data
        except Exception as e:
            print(f"❌ Supabase Fetch Error: {e}")
            return []

    def update_status(self, new_status, count=None):
        self.current_status = new_status
        if count is not None:
            self.people_count = count

    def upsert_customer(self, cid, status="ACTIVE"):
        now_iso = datetime.utcnow().isoformat()
        
        # Keep our internal cache updated
        if cid not in self.customers:
            self.customers[cid] = {
                "customer_id": cid,
                "first_seen": now_iso,
                "last_seen": now_iso,
                "status": status,
                "dwell_time": 0
            }
            try:
                # First time tracking this person -> INSERT
                self.client.table("customers").insert(self.customers[cid]).execute()
            except Exception as e:
                pass
        else:
            first_seen_time = datetime.fromisoformat(self.customers[cid]["first_seen"])
            current_time = datetime.fromisoformat(now_iso)
            dwell = (current_time - first_seen_time).total_seconds()
            
            self.customers[cid]["last_seen"] = now_iso
            self.customers[cid]["status"] = status
            self.customers[cid]["dwell_time"] = dwell
            try:
                # Person moved/updated -> UPDATE their row without crashing constraints
                self.client.table("customers").update({
                    "last_seen": now_iso, 
                    "status": status,
                    "dwell_time": dwell
                }).eq("customer_id", cid).execute()
            except Exception as e:
                pass

# Singleton exported so the rest of the app doesn't need to reconnect
db = Database()
