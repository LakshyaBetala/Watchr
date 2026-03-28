from flask import Blueprint, jsonify
from database.db import db

status_bp = Blueprint('status', __name__)

@status_bp.route("/status", methods=["GET"])
def get_status():
    """
    Provides immediate system overview for the frontend.
    """
    return jsonify({
        "status": db.current_status,
        "people_count": db.people_count
    })
