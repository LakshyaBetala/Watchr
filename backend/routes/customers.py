from flask import Blueprint, jsonify
from services.tracking_service import get_customer_analytics

customers_bp = Blueprint('customers', __name__)

@customers_bp.route("/customers", methods=["GET"])
def get_customers():
    """
    Dashboards analytics data handler
    """
    analytics = get_customer_analytics()
    return jsonify(analytics)
