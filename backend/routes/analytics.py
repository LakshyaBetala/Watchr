from flask import Blueprint, jsonify
from services.gemini_service import gemini_engine

analytics_bp = Blueprint('analytics', __name__)

@analytics_bp.route("/analytics", methods=["GET"])
def get_analytics():
    """
    Returns the last Gemini-generated retail analytics snapshot.
    Lets the frontend bootstrap charts immediately on page load
    without waiting for the next 20-second SSE batch.
    """
    snapshot = gemini_engine.last_snapshot
    if not snapshot:
        return jsonify({
            "status": "pending",
            "message": "Gemini insights not yet available. Waiting for first telemetry batch.",
            "employees": [],
            "shiftActivity": [],
            "demographics": [],
            "footfallHourly": [],
            "heatmapZones": [],
            "dwellByZone": [],
            "allAlerts": [],
            "kpiSummary": {},
            "storesData": [],
            "camerasData": [],
            "storeNarrative": ""
        }), 200

    return jsonify({**snapshot, "status": "ok"}), 200
