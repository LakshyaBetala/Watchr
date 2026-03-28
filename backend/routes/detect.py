from flask import Blueprint, request, jsonify
from services.decision_engine import process_detection_event

detect_bp = Blueprint('detect', __name__)

@detect_bp.route("/detect", methods=["POST"])
def detect():
    """
    POST webhook hitting from the external AI/YOLO model team scripts.
    """
    data = request.json
    if not data:
        return jsonify({"error": "Invalid JSON payload"}), 400
        
    # Dispatch logic
    event_state = process_detection_event(data)
    
    return jsonify({
        "status": "success",
        "system_state": event_state
    })
