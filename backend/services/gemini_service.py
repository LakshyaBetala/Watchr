import threading
import time
import json
import logging
import queue
import os
import google.generativeai as genai
from dotenv import load_dotenv
from config import Config

logger = logging.getLogger(__name__)
load_dotenv()

# SSE Queues for the frontend insights stream
insights_clients = []

class GeminiInsightsService:
    def __init__(self):
        self.buffer = []
        self.running = False
        self.thread = None
        
        # Configure Gemini
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key or api_key == "your_api_key_here":
            logger.warning("GEMINI_API_KEY not set in .env! Gemini Insights stream disabled.")
            return
            
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-1.5-flash')
        self.running = True
        self.start_thread()
        logger.info("Gemini Insights Service initialized. Buffering telemetry...")

    def start_thread(self):
        self.thread = threading.Thread(target=self._loop, daemon=True)
        self.thread.start()

    def add_event(self, event_data):
        if not self.running: return
        # Keep buffer lightweight (max 300 roughly equates to 30s at 10fps loop)
        if len(self.buffer) < 300:
            self.buffer.append(event_data)

    def _loop(self):
        while self.running:
            time.sleep(20) # 20 second rolling window batch buffer
            try:
                self._generate_insights()
            except Exception as e:
                logger.error(f"Gemini API Error: {str(e)}")

    def _generate_insights(self):
        if not self.buffer:
            return
            
        # Sample the buffer to stay strictly within token limits (1 per 10 frames)
        sampled_buffer = self.buffer[::10] if len(self.buffer) > 20 else self.buffer
        self.buffer.clear() # Reset for the next 20 seconds
        
        prompt = f"""
        You are Watchr's Semantic Insights Engine processing 20 seconds of CCTV telemetry for a store.
        Raw Telemetry Array:
        {json.dumps(sampled_buffer)}
        
        Generate a strictly valid JSON response (NO markdown formatting, NO codeblocks, just raw JSON) matching this EXACT schema:
        {{
          "employees": [
            {{ "id": "EMP-001", "name": "Jane Doe", "status": "active", "shift": "Morning Shift", "faceConf": 0.98, "uniform": "#10b981" }}
          ],
          "demographics": [
            {{ "age": "18-24", "gender": "Female", "count": 2 }}
          ],
          "allAlerts": [
             {{ "id": "msg-1", "time": "Just now", "type": "Behavior", "severity": "medium", "description": "Customer browsing shelves.", "camera": "Cam 1", "module": "TheftMonitor", "store": "Store Alpha", "status": "resolved" }}
          ],
          "storeNarrative": "A 1-sentence narrative of what occurred in the frame based on the JSON array (e.g. 'A threat of theft was recognized...')."
        }}
        INSTRUCTIONS:
        - Analyze the "fire", "smoke", "theft", and "people_count" bools and ints.
        - Create 1-3 highly plausible employee identities that could be working based on the roles dictionary and assign them random aesthetic tech colors for "uniform".
        - Generate realistic "allAlerts" incident objects matching the raw JSON truth (e.g., if fire=true, make a critical fire alert).
        - IMPORTANT: Output only the raw dictionary JSON string.
        """
        
        response = self.model.generate_content(prompt)
        text = response.text.replace("```json", "").replace("```", "").strip()
        
        try:
            parsed = json.loads(text)
            # Broadcast to listening React clients via SSE
            for q in insights_clients:
                if q.full():
                    try: q.get_nowait()
                    except queue.Empty: pass
                q.put(parsed)
        except json.JSONDecodeError:
            logger.error("Gemini returned invalid JSON format.")

# Global instance initialized upon backend launch
gemini_engine = GeminiInsightsService()
