from flask import Blueprint, request, jsonify, Response, send_from_directory
from services.decision_engine import process_detection_event
from services.gemini_service import gemini_engine, insights_clients
import json
import queue
import os
import queue

detect_bp = Blueprint('detect', __name__)

# Thread-safe broadcast queues for connected SSE clients
clients = []

@detect_bp.route("/evidence/<path:filename>", methods=["GET"])
def serve_evidence(filename):
    evidence_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "ai-engine", "evidence", "theft")
    return send_from_directory(evidence_dir, filename)

@detect_bp.route("/stream", methods=["GET"])
def stream():
    def event_stream():
        q = queue.Queue(maxsize=100)
        clients.append(q)
        try:
            while True:
                # Block until new data drops
                data = q.get()
                # Server-Sent Events standard formatting
                yield f"data: {json.dumps(data)}\n\n"
        except GeneratorExit:
            clients.remove(q)
            
    response = Response(event_stream(), content_type='text/event-stream')
    # Prevent proxy caching
    response.headers['Cache-Control'] = 'no-cache'
    response.headers['X-Accel-Buffering'] = 'no'
    return response

@detect_bp.route("/detect", methods=["POST"])
def detect():
    """
    POST webhook hitting from the external AI/YOLO model team scripts.
    """
    data = request.json
    if not data:
        return jsonify({"error": "Invalid JSON payload"}), 400
        
    clip_path = data.get("clip_url", "")
    http_clip_url = clip_path
    if clip_path and str(clip_path).startswith("/"):
        filename = os.path.basename(clip_path)
        http_clip_url = f"http://localhost:5050/api/evidence/{filename}"
        
    data["http_clip_url"] = http_clip_url
    data["absolute_clip_path"] = clip_path
        
    # Dispatch logic inside the decision engine
    event_state = process_detection_event(data)
    
    # Send dropping frame to the Gemini rolling 20s buffer
    gemini_engine.add_event(data)
    
    # Broadcast the FULL raw live payload to any listening frontend dashboards
    for q in clients:
        # If queue is full, drop oldest to prevent memory leaks from dead clients
        if q.full():
            try: q.get_nowait()
            except queue.Empty: pass
        q.put(data)
    
    return jsonify({
        "status": "success",
        "system_state": event_state
    })

@detect_bp.route("/insights/stream", methods=["GET"])
def stream_insights():
    def event_stream():
        q = queue.Queue(maxsize=20)
        insights_clients.append(q)
        try:
            while True:
                data = q.get()
                yield f"data: {json.dumps(data)}\n\n"
        except GeneratorExit:
            insights_clients.remove(q)
            
    response = Response(event_stream(), content_type='text/event-stream')
    response.headers['Cache-Control'] = 'no-cache'
    response.headers['X-Accel-Buffering'] = 'no'
    return response
