import uuid

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from website import db

parking = Blueprint('parking', __name__)
parking_collection = db['parkings']

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

    if data['floors'] < 1:
        return jsonify({"msg": "Invalid floors number"}), 400

    if data['spots_per_floor'] < 1:
        return jsonify({"msg": "Invalid spots number"}), 400

    if data["day_rate"] < 0.0 or data["night_rate"] < 0.0:
        return jsonify({"msg": "Invalid rates"}), 400

    from itertools import product
    spots = [{"floor": y, "spot": x, "available": True}
             for y, x in product(range(data['floors']), range(data['spots_per_floor']))]

    user_id = get_jwt_identity()

    new_parking = {
        "_id": str(uuid.uuid4()),
        "owner_id": user_id,
        "address": data["address"],
        "spots": spots,
        "current_usage": [],
        "history": [],
        "day_rate": data["day_rate"],
        "night_rate": data["night_rate"],
        "day_time_start": data["day_time_start"],
        "day_time_end": data["day_time_end"],
    }

    parking_collection.insert_one(new_parking)

    return jsonify({"msg": "New parking added"})
