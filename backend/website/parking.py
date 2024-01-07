from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required

parking = Blueprint('parking', __name__)


@parking.route("/make", methods=["POST"])
@jwt_required()
def create_parking():
    """
    Create parking basing on input data:
    {
        "address":          <string>,
        "floors":           <integer>,
        "spots_per_floor":  <integer>,
        "day_rate":         <float>,
        "night_rate":       <float>,
        "day_time_start":   <string>,   # HH:mm time format
        "day_time_end":     <string>    # HH:mm time format
    }
    """
    required_params = {
        "address",
        "floors",
        "spots_per_floor",
        "day_rate",
        "night_rate",
        "day_time_start",
        "day_time_end"
    }
    data = request.get_json()
    if data is None:
        return jsonify({"msg": "Missing data"}), 400
    missing_keys = required_params - set(data)
    if len(missing_keys):
        return jsonify({"msg": "Missing key-values", "missing": list(missing_keys)}), 400


    return "xD", 200
