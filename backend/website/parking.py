import uuid
from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from website import db

parking = Blueprint('parking', __name__)
parking_collection = db['parkings']
user_collection = db['users']


def parse_str_to_time(time_str):
    return datetime.strptime(time_str, '%H:%M').time()


def parse_time_to_str(time):
    return time.strftime("%H:%M")


def has_car_parked(plate):
    query = {"current_usage": {"$elemMatch": {"car": plate}}}
    results = parking_collection.find(query)
    return len(list(results)) > 0


def check_car_ownership(plate, user_id):
    return plate in user_collection.find_one({"_id": user_id})["license_plates"]


@parking.route("/make", methods=["POST"])
@jwt_required()
def create_parking():
    """
    Create parking basing on input data:
    {
        "address":              <string>,
        "floors":               <integer>,
        "spots_per_floor":      <integer>,
        "day_rate":             <float>,
        "night_rate":           <float>,
        "day_time_start":       <string>,   # HH:mm time format
        "day_time_end":         <string>,   # HH:mm time format
        # Optional
        "first_hour":           <float>,    # [0.1, 2.0]
        "rate_from_six_hours":  <float>,    # [0.1, 2.0]
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
    if missing_keys:
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

    try:
        data["day_time_start"] = parse_str_to_time(data["day_time_start"])
        data["day_time_end"] = parse_str_to_time(data["day_time_end"])
    except ValueError:
        return jsonify({"msg": "Invalid day time"}), 400

    # Handling extra rules
    extra_rules = {
        "first_hour": data.get("first_hour"),
        "rate_from_six_hours": data.get("rate_from_six_hours")
    }
    extra_rules = {rule: value for rule, value in extra_rules if value is not None}

    new_parking = {
        "_id": str(uuid.uuid4()),
        "owner_id": user_id,
        "address": data["address"],
        "spots": spots,
        "current_usage": [],
        "history": [],
        "day_rate": data["day_rate"],
        "night_rate": data["night_rate"],
        "day_time_start": parse_time_to_str(data["day_time_start"]),
        "day_time_end": parse_time_to_str(data["day_time_end"]),
        "extra_rules": extra_rules
    }

    parking_collection.insert_one(new_parking)

    return jsonify({"msg": "New parking added"}), 201


@parking.route("/check_plate/<plate>", methods=["GET"])
@jwt_required()
def check_car_status(plate):
    user_id = get_jwt_identity()

    if not check_car_ownership(plate, user_id):
        return jsonify({"msg": "User does not have a car with given license plate"}), 400

    if has_car_parked(plate):
        return jsonify({"msg": "The car is parked"}), 200
    else:
        return jsonify({"msg": "The car is not parked"}), 200


@parking.route("/find_cheapest", methods=["GET"])
@jwt_required()
def find_cheapest():
    parking_lots = parking_collection.find({})

    current_time = datetime.now().time()

    cheapest_rate = float('inf')
    cheapest_lot = None

    for lot in parking_lots:
        day_start = parse_str_to_time(lot['day_time_start'])
        day_end = parse_str_to_time(lot['day_time_end'])

        if day_start <= current_time <= day_end:
            rate = lot['day_rate']
        else:
            rate = lot['night_rate']

        if any(spot['available'] for spot in lot['spots']):
            if rate < cheapest_rate:
                cheapest_rate = rate
                cheapest_lot = lot

    if cheapest_lot:
        return jsonify(cheapest_lot), 200
    else:
        return jsonify({"msg": "There is no parking available"}), 404


@parking.route("/park", methods=["POST"])
@jwt_required()
def park_the_car():
    required_params = {
        "plate",
        "parking_id"
    }
    data = request.get_json()

    if data is None:
        return jsonify({"msg": "Missing data"}), 400
    missing_keys = required_params - set(data)
    if missing_keys:
        return jsonify({"msg": "Missing key-values", "missing": list(missing_keys)}), 400

    user_id = get_jwt_identity()
    plate = data['plate']
    parking_id = data['parking_id']

    if not check_car_ownership(plate, user_id):
        return jsonify({"msg": "User does not have a car with given license plate"}), 400

    if has_car_parked(plate):
        return jsonify({"msg": "The car has already parked"}), 400

    parking_lot = parking_collection.find_one({"_id": parking_id})
    if not parking_lot:
        return jsonify({"msg": "Parking not found"}), 404

    current_time = datetime.now().time()

    for spot in parking_lot['spots']:
        if spot['available']:
            spot['available'] = False

            current_usage_update = {
                "floor": spot['floor'],
                "spot": spot['spot'],
                "car": plate,
                "start_time": parse_time_to_str(current_time),
                "end_time": None
            }

            parking_collection.update_one(
                {"_id": parking_lot['_id']},
                {"$push": {"current_usage": current_usage_update},
                 "$set": {"spots": parking_lot['spots']}}
            )
            return jsonify({"msg": "The car is successfully parked"}), 200
    return jsonify({"msg": "No spot available on this parking"}), 404
