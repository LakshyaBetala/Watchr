from flask import Blueprint, request, jsonify, Response
from services.decision_engine import process_detection_event
from services.gemini_service import gemini_engine, insights_clients
import json
import queue

detect_bp = Blueprint('detect', __name__)

# Thread-safe broadcast queues for connected SSE clients
clients = []

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
