from flask import Blueprint, jsonify, request
from database.db import db

logs_bp = Blueprint('logs', __name__)

@logs_bp.route("/logs", methods=["GET"])
def get_logs():
    """
    Endpoint for the UI to poll historical events
    """
    limit = int(request.args.get('limit', 50))
    return jsonify({
        "logs": db.get_logs(limit=limit)
    })
