import math
import uuid
from collections import defaultdict

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from website import db
from flask_cors import cross_origin
from datetime import datetime, timedelta

parking = Blueprint('parking', __name__)
parking_collection = db['parkings']
user_collection = db['users']


@parking.before_request
def before_request():
    headers = {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
               'Access-Control-Allow-Headers': 'Content-Type'}
    if request.method == 'OPTIONS' or request.method == 'options':
        return jsonify(headers), 200


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
@cross_origin()
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
        "day_time_end",
        "costs"
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

    if 'costs' not in data or not isinstance(data['costs'], list):
        return jsonify({"msg": "Missing or invalid costs"}), 400

    costs = []
    for cost_data in data['costs']:
        if not all(key in cost_data for key in ['name', 'price', 'periodic', 'start_date']):
            return jsonify({"msg": "Missing key in cost data"}), 400
        cost = {
            "_id": str(uuid.uuid4()),
            "name": cost_data['name'],
            "price": cost_data['price'],
            "periodic": cost_data['periodic'],
            "start_date": cost_data['start_date'],
            "end_date": None if cost_data['periodic'] else cost_data['start_date']
        }
        costs.append(cost)

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
    extra_rules = {rule: value for rule, value in extra_rules.items() if value is not None}

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
        "extra_rules": extra_rules,
        "costs": costs
    }

    parking_collection.insert_one(new_parking)

    return jsonify({"msg": "New parking added"}), 201


@parking.route("/check_plate/<plate>", methods=["GET"])
@cross_origin()
@jwt_required()
def check_car_status(plate):
    user_id = get_jwt_identity()

    if not check_car_ownership(plate, user_id):
        return jsonify({"msg": "User does not have a car with given license plate"}), 400

    if has_car_parked(plate):
        parking_lot = parking_collection.find_one({"current_usage": {"$elemMatch": {"car": plate}}})
        for usage in parking_lot['current_usage']:
            if usage['car'] == plate:
                return jsonify({"msg": "The car is parked",
                                "parking_id": parking_lot['_id'],
                                "parking_address": parking_lot['address'],
                                "floor": usage['floor'],
                                "spot": usage['spot']
                                }), 200
    else:
        return jsonify({"msg": "The car is not parked"}), 200


@parking.route("/find_cheapest", methods=["GET"])
@cross_origin()
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
        cheapest_lot.pop("current_usage")
        cheapest_lot.pop("history")
        cheapest_lot.pop("costs")
        return jsonify(cheapest_lot), 200
    else:
        return jsonify({"msg": "No parking available"}), 404


@parking.route("/park", methods=["POST"])
@cross_origin()
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

    current_time = datetime.now()

    for spot in parking_lot['spots']:
        if spot['available']:
            spot['available'] = False

            current_usage_update = {
                "floor": spot['floor'],
                "spot": spot['spot'],
                "car": plate,
                "start_time": current_time,
                "end_time": None
            }

            parking_collection.update_one(
                {"_id": parking_lot['_id']},
                {"$push": {"current_usage": current_usage_update},
                 "$set": {"spots": parking_lot['spots']}}
            )
            return jsonify({"msg": "The car is successfully parked"}), 200
    return jsonify({"msg": "No spot available on this parking"}), 404


def calculate_parking_fee(start_datetime, end_datetime, day_rate, night_rate, day_start, day_end,
                           first_hour_multiplier, special_rate_multiplier, discount_hours=7):
    total_duration = (end_datetime - start_datetime).total_seconds() / 3600

    if total_duration <= 0:
        return 0

    total_cost = 0.0
    hours_counted = 0

    while total_duration > 0:
        if hours_counted == 0:
            if day_start <= start_datetime.time() < day_end:
                total_cost += day_rate * first_hour_multiplier
            else:
                total_cost += night_rate * first_hour_multiplier
        elif 0 < hours_counted < discount_hours:
            if day_start <= start_datetime.time() < day_end:
                total_cost += day_rate * special_rate_multiplier
            else:
                total_cost += night_rate * special_rate_multiplier
        else:
            if day_start <= start_datetime.time() < day_end:
                total_cost += day_rate
            else:
                total_cost += night_rate

        start_datetime += timedelta(hours=1)
        total_duration -= 1
        hours_counted += 1

    return total_cost


@parking.route("/estimate_parking_fee", methods=["POST"])
@cross_origin()
@jwt_required()
def estimate_parking_fee():
    data = request.get_json()
    plate = data['plate']
    parking_id = data['parking_id']

    parking_lot = parking_collection.find_one({"_id": parking_id})
    if not parking_lot:
        return jsonify({"msg": "Parking not found"}), 404

    for usage in parking_lot['current_usage']:
        if usage['car'] == plate:
            start_time = datetime.strptime(usage['start_time'], "%Y-%m-%d %H:%M:%S")
            end_time = datetime.now()
            fee = calculate_parking_fee(
                start_time, end_time,
                parking_lot['day_rate'],
                parking_lot['night_rate'],
                parse_str_to_time(parking_lot['day_time_end']),
                parse_str_to_time(parking_lot['day_time_start']),
                parking_lot['extra_rules'].get('first_hour', 1.0),
                parking_lot['extra_rules'].get('rate_from_six_hours', 1.0)
            )
            return jsonify({"estimated_fee": fee}), 200

    return jsonify({"msg": "Car not found in parking"}), 404


@parking.route("/unpark", methods=["POST"])
@cross_origin()
@jwt_required()
def unpark_car():
    data = request.get_json()
    plate = data['plate']

    user_id = get_jwt_identity()
    user = user_collection.find_one({"_id": user_id})
    parking_lot = parking_collection.find_one({"current_usage": {"$elemMatch": {"car": plate}}})
    parking_id = parking_lot['_id']

    if not parking_lot:
        return jsonify({"msg": "Parking not found"}), 404

    for usage in parking_lot['current_usage']:
        if usage['car'] == plate:
            start_time = usage['start_time']
            end_time = datetime.now()
            fee = calculate_parking_fee(
                start_time, end_time,
                parking_lot['day_rate'],
                parking_lot['night_rate'],
                parse_str_to_time(parking_lot['day_time_end']),
                parse_str_to_time(parking_lot['day_time_start']),
                parking_lot['extra_rules'].get('first_hour', 1.0),
                parking_lot['extra_rules'].get('rate_from_six_hours', 1.0)
            )

            if float(user['money'].to_decimal()) < fee:
                return jsonify({"msg": "Insufficient funds"}), 400

            user_collection.update_one(
                {"_id": user_id},
                {"$inc": {"money": -fee}}
            )

            parking_collection.update_one(
                {"_id": parking_id},
                {"$pull": {"current_usage": {"car": plate}}}
            )

            occupied_spot = usage['spot']
            occupied_floor = usage['floor']

            for spot in parking_lot['spots']:
                if spot['floor'] == occupied_floor and spot['spot'] == occupied_spot:
                    spot['available'] = True
                    parking_collection.update_one(
                        {"_id": parking_id},
                        {"$set": {"spots": parking_lot['spots']}}
                    )
                    break

            history_record = {
                "license_plate": plate,
                "start_date": start_time,
                "end_date": end_time,
                "floor": occupied_floor,
                "spot": occupied_spot,
                "paid": fee
            }
            parking_collection.update_one(
                {"_id": parking_id},
                {"$push": {"history": history_record}}
            )

            return jsonify({"msg": "Car unparked successfully", "charged_fee": fee}), 200

    return jsonify({"msg": "Car not found in parking"}), 404


@parking.route("/parkings", methods=["GET"])
@cross_origin()
def get_all_parkings():
    parkings = list(parking_collection.find({}))
    for p in parkings:
        p.pop('current_usage')
        p.pop('history')
        if 'costs' in p:
            p.pop('costs')

    return jsonify(parkings), 200


@parking.route("/search_parking", methods=["GET"])
@cross_origin()
def search_parking():
    parking_name = request.args.get('address')

    if not parking_name:
        return jsonify({"msg": "Parking address is required"}), 400

    parkings = parking_collection.find({"address": {"$regex": parking_name, "$options": "i"}})
    # parking_list = [{"id": str(parking["_id"]), "address": parking["address"]} for parking in parkings]
    parking_list = []
    for p in parkings:
        p.pop('current_usage')
        p.pop('history')
        if 'costs' in p:
            p.pop('costs')
        parking_list.append(p)

    if parking_list:
        return jsonify(parking_list)
    else:
        return jsonify({"msg": "No parking found with given name"}), 404


@parking.route("/parking_details/<id>", methods=["GET"])
@cross_origin()
@jwt_required()
def get_parking(parking_id):
    user_id = get_jwt_identity()
    parking = parking_collection.find_one({"_id": parking_id})
    if parking['owner_id'] == user_id:
        return jsonify(parking), 200
    return jsonify({"msg": "The parking does not belong to this account"}), 401


@parking.route("/costs", methods=["POST"])
@cross_origin()
@jwt_required()
def add_cost():
    required_params = {
        "parking_id",
        "name",
        "price",
        "periodic",
        "start_date"
    }

    data = request.get_json()

    if data is None:
        return jsonify({"msg": "Missing data"}), 400
    missing_keys = required_params - set(data)
    if missing_keys:
        return jsonify({"msg": "Missing key-values", "missing": list(missing_keys)}), 400

    user_id = get_jwt_identity()
    parking_id = data['parking_id']

    parking = parking_collection.find_one({"_id": parking_id})

    if user_id != parking['owner_id']:
        return jsonify({"msg": "Unauthorized access"}), 403

    try:
        parsed_start_date = datetime.strptime(data['start_date'], "%Y-%m-%d")
    except ValueError:
        return jsonify({"msg": "Invalid start_date format, expected 'yyyy-mm-dd'"}), 400

    cost = {
        "_id": str(uuid.uuid4()),
        "name": data['name'],
        "price": data['price'],
        "periodic": data['periodic'],
        "start_date": parsed_start_date,
        "end_date": None if data['periodic'] else parsed_start_date
    }

    parking_collection.update_one(
        {'_id': parking_id},
        {'$push': {'costs': cost}}
    )

    return jsonify({"msg": "Successfully added"}), 200


@parking.route("/costs/<parking_id>", methods=["GET"])
@cross_origin()
@jwt_required()
def get_costs(parking_id):
    user_id = get_jwt_identity()
    parking = parking_collection.find_one({"_id": parking_id})

    if parking is None:
        return jsonify({"msg": "Parking not found"}), 404
    if parking['owner_id'] != user_id:
        return jsonify({"msg": "Unauthorized access"}), 403

    formatted_costs = []
    for cost in parking.get('costs', []):
        formatted_cost = cost.copy()
        if 'start_date' in cost and cost['start_date']:
            formatted_cost['start_date'] = cost['start_date'].strftime("%Y-%m-%d")
        if 'end_date' in cost and cost['end_date']:
            formatted_cost['end_date'] = cost['end_date'].strftime("%Y-%m-%d") if cost['end_date'] else None
        formatted_costs.append(formatted_cost)

    return jsonify({"costs": formatted_costs}), 200


@parking.route("/costs/update", methods=["PUT"])
@cross_origin()
@jwt_required()
def update_cost():
    user_id = get_jwt_identity()
    data = request.get_json()

    if not data or 'parking_id' not in data or 'cost_id' not in data:
        return jsonify({"msg": "Missing parking_id or cost_id"}), 400

    parking_id = data['parking_id']
    cost_id = data['cost_id']

    parking = parking_collection.find_one({"_id": parking_id, "owner_id": user_id})
    if not parking:
        return jsonify({"msg": "Unauthorized or parking not found"}), 403

    update_result = parking_collection.update_one(
        {"_id": parking_id, "costs._id": cost_id},
        {"$set": {
            "costs.$.name": data.get("name"),
            "costs.$.price": data.get("price"),
            "costs.$.periodic": data.get("periodic"),
            "costs.$.start_date": data.get("start_date"),
            "costs.$.end_date": data.get("end_date")
        }}
    )

    if update_result.modified_count == 0:
        return jsonify({"msg": "Cost not found or update failed"}), 404

    return jsonify({"msg": "Cost updated successfully"}), 200


@parking.route("/costs/delete", methods=["DELETE"])
@cross_origin()
@jwt_required()
def delete_cost():
    user_id = get_jwt_identity()
    data = request.get_json()

    if not data or 'parking_id' not in data or 'cost_id' not in data:
        return jsonify({"msg": "Missing parking_id or cost_id"}), 400

    parking_id = data['parking_id']
    cost_id = data['cost_id']

    # Verify if the user is the owner of the parking
    parking = parking_collection.find_one({"_id": parking_id, "owner_id": user_id})
    if not parking:
        return jsonify({"msg": "Unauthorized or parking not found"}), 403

    # Remove the specific cost from the parking document
    delete_result = parking_collection.update_one(
        {"_id": parking_id},
        {"$pull": {"costs": {"_id": cost_id}}}
    )

    if delete_result.modified_count == 0:
        return jsonify({"msg": "Cost not found or removal failed"}), 404

    return jsonify({"msg": "Cost removed successfully"}), 200

@parking.route("/statistics/spots/<parking_id>", methods=["GET"])
@cross_origin()
@jwt_required()
def parking_spots_statistics(parking_id):
    user_id = get_jwt_identity()
    parking = parking_collection.find_one({"_id": parking_id})

    if parking is None:
        return jsonify({"msg": "Parking not found"}), 404
    if parking['owner_id'] != user_id:
        return jsonify({"msg": "Unauthorized access"}), 403

    spots_statistics = {}
    for spot in parking.get('spots', []):
        spot_identifier = f"{spot['floor']}-{spot['spot']}"
        spots_statistics[spot_identifier] = {"total_earnings": 0, "history": [], "availability": spot['available']}

    for entry in parking.get('history', []):
        spot_identifier = f"{entry['floor']}-{entry['spot']}"
        if spot_identifier in spots_statistics:
            spots_statistics[spot_identifier]["total_earnings"] += entry['paid']
            formatted_entry = entry.copy()
            formatted_entry['start_date'] = entry['start_date'].strftime("%Y-%m-%d %H:%M:%S")
            formatted_entry['end_date'] = entry['end_date'].strftime("%Y-%m-%d %H:%M:%S") if entry.get(
                'end_date') else None
            spots_statistics[spot_identifier]["history"].append(formatted_entry)

    formatted_statistics = [{
        "floor": int(identifier.split('-')[0]),
        "spot_number": int(identifier.split('-')[1]),
        "availability": stats["availability"],
        "total_earnings": stats["total_earnings"],
        "history": stats["history"]
    } for identifier, stats in spots_statistics.items()]

    return jsonify({"parking_id": parking_id, "spots_statistics": formatted_statistics}), 200



@parking.route("/statistics/cars", methods=["GET"])
@cross_origin()
@jwt_required()
def car_parking_statistics():
    user_id = get_jwt_identity()
    car_license_plate = request.args.get("license_plate")

    if not car_license_plate:
        return jsonify({"msg": "Missing car license plate"}), 400

    all_parkings = parking_collection.find({"history.license_plate": car_license_plate, "owner_id": user_id})

    total_paid = 0
    car_history = []

    for parking in all_parkings:
        for entry in parking.get('history', []):
            if entry['license_plate'] == car_license_plate:
                total_paid += entry['paid']
                car_history.append({
                    "parking_id": parking['_id'],
                    "address": parking['address'],
                    "start_date": entry['start_date'].strftime("%Y-%m-%d %H:%M:%S"),
                    "end_date": entry['end_date'].strftime("%Y-%m-%d %H:%M:%S") if entry.get('end_date') else None,
                    "paid": entry['paid']
                })

    return jsonify({"car_license_plate": car_license_plate, "total_paid": total_paid, "history": car_history}), 200


@parking.route("/costs/summary", methods=["POST"])
@cross_origin()
@jwt_required()
def parking_costs_summary():
    user_id = get_jwt_identity()
    data = request.get_json()

    if not data or not all(k in data for k in ('parking_id', 'start_date', 'end_date')):
        return jsonify({"msg": "Missing required data"}), 400

    parking_id = data['parking_id']
    start_date = data['start_date']
    end_date = data['end_date']

    parking = parking_collection.find_one({"_id": parking_id})
    if not parking:
        return jsonify({"msg": "Parking not found"}), 404
    if parking['owner_id'] != user_id:
        return jsonify({"msg": "Unauthorized access"}), 403

    try:
        start_date_dt = datetime.strptime(start_date, "%Y-%m-%d")
        end_date_dt = datetime.strptime(end_date, "%Y-%m-%d")
    except ValueError:
        return jsonify({"msg": "Invalid date format, expected YYYY-MM-DD"}), 400

    cost_summary_per_month = {}
    monthly_costs = [cost for cost in parking.get('costs', [])]

    current_month = start_date_dt.replace(day=1)
    while current_month <= end_date_dt:
        month_str = current_month.strftime("%Y-%m")
        cost_summary_per_month[month_str] = {'total_cost': 0, 'details': []}

        for cost in monthly_costs:
            cost_start_dt = cost['start_date']
            cost_end_dt = cost.get('end_date', None)

            if cost['periodic']:
                if (cost_start_dt < current_month + timedelta(days=32)) and (
                        not cost_end_dt or cost_end_dt >= current_month):
                    cost_summary_per_month[month_str]['total_cost'] += cost['price']
                    cost['start_date'] = cost['start_date']
                    cost['end_date'] = cost['end_date'] if cost.get('end_date') else None
                    cost_summary_per_month[month_str]['details'].append({
                        **cost,
                        "start_date": cost['start_date'].strftime("%Y-%m-%d %H:%M:%S"),
                        "end_date": cost['end_date'] if cost['end_date'] else None
                    })
            elif cost_start_dt.year == current_month.year and cost_start_dt.month == current_month.month:
                cost_summary_per_month[month_str]['total_cost'] += cost['price']
                cost_summary_per_month[month_str]['details'].append({
                    **cost,
                    "start_date": cost['start_date'].strftime("%Y-%m-%d %H:%M:%S"),
                    "end_date": cost['end_date'] if cost['end_date'] else None
                    }
                )

        current_month = (current_month.replace(day=28) + timedelta(days=4)).replace(day=1)

    response_data = [{
        "month": month,
        "total_cost": details['total_cost'],
        "costs": [dict(detail, start_date=detail['start_date'], end_date=detail.get('end_date', 'ongoing')) for detail
                  in details['details']]
    } for month, details in sorted(cost_summary_per_month.items())]

    return jsonify({"parking_id": parking_id, "cost_summary": response_data}), 200

@parking.route("/summary", methods=["POST"])
@cross_origin()
@jwt_required()
def parking_profit_summary():
    user_id = get_jwt_identity()
    data = request.get_json()

    if not data or not all(k in data for k in ('parking_id', 'start_date', 'end_date')):
        return jsonify({"msg": "Missing required data"}), 400

    parking_id = data['parking_id']
    start_date = data['start_date']
    end_date = data['end_date']

    parking = parking_collection.find_one({"_id": parking_id})
    if not parking:
        return jsonify({"msg": "Parking not found"}), 404
    if parking['owner_id'] != user_id:
        return jsonify({"msg": "Unauthorized access"}), 403

    try:
        start_date_dt = datetime.strptime(start_date, "%Y-%m-%d")
        end_date_dt = datetime.strptime(end_date, "%Y-%m-%d")
    except ValueError:
        return jsonify({"msg": "Invalid date format, expected YYYY-MM-DD"}), 400

    monthly_costs = defaultdict(float)
    monthly_earnings = defaultdict(float)

    for cost in parking.get('costs', []):
        process_monthly_entries(cost, monthly_costs, start_date_dt, end_date_dt, True)

    for entry in parking.get('history', []):
        payment_date = entry['start_date']
        month_str = payment_date.strftime("%Y-%m")
        if start_date_dt <= payment_date <= end_date_dt:
            monthly_earnings[month_str] += entry['paid']

    profit_summary = []
    current_month = start_date_dt.replace(day=1)
    while current_month <= end_date_dt:
        month_str = current_month.strftime("%Y-%m")
        profit = monthly_earnings[month_str] - monthly_costs[month_str]
        profit_summary.append({
            "month": month_str,
            "earnings": monthly_earnings[month_str],
            "cost": monthly_costs[month_str],
            "profit": profit
        })
        current_month = (current_month.replace(day=28) + timedelta(days=4)).replace(day=1)

    profit_summary_sorted = sorted(profit_summary, key=lambda x: x['month'])

    return jsonify({"parking_id": parking_id, "profit_summary": profit_summary_sorted}), 200


def process_monthly_entries(entry, monthly_tracker, start_date, end_date, is_cost):
    start_dt = entry['start_date']
    end_dt = entry.get('end_date', None)
    current_month = start_date
    while current_month <= end_date:
        month_str = current_month.strftime("%Y-%m")
        if is_cost and entry.get('periodic', False):
            if not end_dt or current_month <= end_dt:
                monthly_tracker[month_str] += entry['price']
        elif start_dt.year == current_month.year and start_dt.month == current_month.month:
            monthly_tracker[month_str] += entry['price']
        current_month = (current_month.replace(day=28) + timedelta(days=4)).replace(day=1)
