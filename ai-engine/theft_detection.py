import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class TheftDetectionEngine:
    def __init__(self, shelf_dwell_threshold=3, theft_confirm_threshold=3):
        """
        Initializes the behavioral theft detection state machine.
        
        Args:
            shelf_dwell_threshold (int): Frames consecutive in 'shelf' to count as product engagement.
            theft_confirm_threshold (int): Frames maintaining theft condition to trigger alarm.
        """
        # Per-ID state dictionary
        self.states = {}
        self.shelf_dwell_threshold = shelf_dwell_threshold
        self.theft_confirm_threshold = theft_confirm_threshold

    def _init_state(self):
        """Generates a fresh state template for a new tracking ID."""
        return {
            "visited_shelf": False,
            "visited_billing": False,
            "entered_exit": False,
            "dwell_time": 0,
            "dwell_time_billing": 0,
            "last_zone": "unknown",
            "theft_counter": 0
        }

    def detect_theft(self, zones_dict):
        """
        Processes current zone mappings and updates the behavioral state machine.
        
        Args:
            zones_dict (dict): { "zones": { "id_str": "zone_name" } }
            
        Returns:
            dict: { "theft": bool, "suspects": [list of id_strs] }
        """
        current_zones = zones_dict.get("zones", {})
        confirmed_suspects = []
        roles = {}
        
        # 1. Clean up stale IDs (If a person drops from the tracking pipeline)
        active_ids = set(current_zones.keys())
        tracked_ids = list(self.states.keys())
        for tid in tracked_ids:
            if tid not in active_ids:
                logger.debug(f"ID {tid} left tracking. Wiping behavior state.")
                del self.states[tid]

        # 2. Update states and evaluate logical transitions
        for obj_id, current_zone in current_zones.items():
            if obj_id not in self.states:
                self.states[obj_id] = self._init_state()
                
            state = self.states[obj_id]
            
            # --- Zone Interaction Transitions ---
            if current_zone == "shelf":
                state["dwell_time"] += 1
                if state["dwell_time"] > self.shelf_dwell_threshold:
                    if not state["visited_shelf"]:
                        logger.info(f"BEHAVIOR: ID {obj_id} engaged with shelf (dwell > {self.shelf_dwell_threshold}).")
                    state["visited_shelf"] = True
            elif current_zone == "billing":
                state["dwell_time_billing"] += 1
                if not state["visited_billing"]:
                    logger.info(f"BEHAVIOR: ID {obj_id} is at checkout/billing. Cleared from suspicion.")
                state["visited_billing"] = True
            elif current_zone == "exit":
                if not state["entered_exit"]:
                    logger.info(f"BEHAVIOR: ID {obj_id} entered the exit zone.")
                state["entered_exit"] = True
                
            state["last_zone"] = current_zone

            # --- Theft Evaluation Logic (Core Anomaly Detection) ---
            # Condition: Engaged product -> Skipped checkout -> Leaving via exit
            if state["visited_shelf"] and not state["visited_billing"] and state["entered_exit"]:
                state["theft_counter"] += 1
                logger.warning(f"SUSPICIOUS: ID {obj_id} at exit without billing! (Hold: {state['theft_counter']}/{self.theft_confirm_threshold})")
                
                # Check Temporal Validation
                if state["theft_counter"] >= self.theft_confirm_threshold:
                    confirmed_suspects.append(obj_id)
                    logger.error(f"🚨 ALERT CONFIRMED: THEFT BY ID {obj_id}!")
                    
                    # Reset state after confirmed alarm to prevent endless cyclic triggers
                    self.states[obj_id] = self._init_state()
            else:
                # If they are behaving normally or retreated from the exit, cool down the anomaly counter
                if not state["entered_exit"]:
                    state["theft_counter"] = 0
                    
            # --- Role Classification Evaluation ---
            # Staff continuously occupy the billing counter. Customers generally pass through.
            if state["dwell_time_billing"] > 60:
                roles[obj_id] = "STAFF"
            else:
                roles[obj_id] = "CUSTOMER"

        # Override roles for confirmed threats
        for suspect in confirmed_suspects:
            roles[suspect] = "SUSPECT"

        # Construct strict output format Payload
        return {
            "theft": len(confirmed_suspects) > 0,
            "suspects": confirmed_suspects,
            "roles": roles
        }

def test_standalone():
    """Dummy temporal simulation strictly matching Architect Scenarios."""
    logger.info("Initializing Behavioral Anomaly Simulator...")
    engine = TheftDetectionEngine(shelf_dwell_threshold=3, theft_confirm_threshold=3)
    
    # SCENARIO: Normal Shopper (ID: "1") vs Shoplifter (ID: "2")
    mock_timeline = [
        {"zones": {"1": "unknown", "2": "unknown"}},
        {"zones": {"1": "shelf", "2": "shelf"}},
        {"zones": {"1": "shelf", "2": "shelf"}},
        {"zones": {"1": "shelf", "2": "shelf"}},
        {"zones": {"1": "shelf", "2": "shelf"}},  # Dwell hits > 3; Both registered as holding item
        {"zones": {"1": "billing", "2": "unknown"}}, # Normal shopper goes to pay. Suspect loiters.
        {"zones": {"1": "billing", "2": "exit"}}, # Suspect attempts exit! (Counter 1)
        {"zones": {"1": "exit", "2": "exit"}},    # Normal shopper leaves legally. Suspect lingers (Counter 2)
        {"zones": {"1": "unknown", "2": "exit"}}  # Normal leaves frame. Suspect still in exit (Counter 3 -> THEFT)
    ]
    
    for i, frame_data in enumerate(mock_timeline):
        logger.info(f"--- Frame {i+1} --- Inputs: {frame_data}")
        result = engine.detect_theft(frame_data)
        if result["theft"]:
            logger.error(f"============================================")
            logger.error(f"🔔 ACTION REQUIRED! System Output: {result}")
            logger.error(f"============================================")

if __name__ == "__main__":
    test_standalone()
