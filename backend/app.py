from flask import Flask, jsonify
from flask_cors import CORS
from config import Config

# Blueprints
from routes.detect import detect_bp
from routes.status import status_bp
from routes.logs import logs_bp
from routes.customers import customers_bp
from routes.analytics import analytics_bp

def create_app():
    app = Flask(__name__)
    CORS(app)
    
    app.config.from_object(Config)
    
    # Registering endpoints with `/api` prefix
    app.register_blueprint(detect_bp, url_prefix='/api')
    app.register_blueprint(status_bp, url_prefix='/api')
    app.register_blueprint(logs_bp, url_prefix='/api')
    app.register_blueprint(customers_bp, url_prefix='/api')
    app.register_blueprint(analytics_bp, url_prefix='/api')
    
    @app.errorhandler(404)
    def resource_not_found(e):
        return jsonify(error=str(e)), 404
        
    @app.route("/")
    def index():
        return jsonify({"status": "Watchr AI Backend is running in secure mode."})
        
    return app

if __name__ == "__main__":
    app = create_app()
    print(f"Starting Hackathon Backend Server on Port {Config.PORT}")
    app.run(host="0.0.0.0", port=Config.PORT, debug=Config.DEBUG)
