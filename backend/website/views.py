from flask import Blueprint, jsonify, request, make_response
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from website import db
from flask_cors import cross_origin
import uuid

views = Blueprint('views', __name__)
users_collection = db['users']
parkings_collection = db['parkings']


@views.route('/register', methods=['POST'])
@cross_origin()
def register():
    data = request.get_json()

    if not data or not data.get('username') or not data.get('password'):
        return make_response('Invalid data', 400)

    if users_collection.find_one({'username': data['username']}):
        return make_response('User already exists', 400)

    hashed_password = generate_password_hash(data['password'], method='sha256')

    new_user = {
        '_id': str(uuid.uuid4()),
        'username': data['username'],
        'password': hashed_password,
        'license_plates': [],
        'is_owner': False,
        'money': 0.0
    }

    users_collection.insert_one(new_user)

    return jsonify({'msg': 'User has been registered'}), 201


@views.route('/login', methods=['POST'])
@cross_origin()
def login():
    data = request.get_json()

    if not data or not data.get('username') or not data.get('password'):
        return make_response('Invalid data', 400)

    user = users_collection.find_one({'username': data['username']})

    if user and check_password_hash(user['password'], data['password']):
        access_token = create_access_token(identity=user['_id'])
        return jsonify(access_token=access_token), 200
    else:
        return make_response('Bad username or password', 401)


@views.route('/user/license_plate', methods=['PUT'])
@cross_origin()
@jwt_required()
def add_license_plate():
    user_id = get_jwt_identity()
    data = request.get_json()
    new_plate = data['license_plate']

    result = users_collection.update_one(
        {'_id': user_id, 'license_plates': {'$ne': new_plate}},
        {'$push': {'license_plates': new_plate}}
    )

    if result.modified_count:
        return jsonify({'msg': 'License plate added successfully'}), 200
    else:
        return jsonify({'msg': 'License plate already exists or user not found'}), 400


@views.route('/user/license_plate', methods=['DELETE'])
@cross_origin()
@jwt_required()
def remove_license_plate():
    user_id = get_jwt_identity()
    data = request.get_json()
    plate_to_remove = data['license_plate']

    result = users_collection.update_one(
        {'_id': user_id},
        {'$pull': {'license_plates': plate_to_remove}}
    )

    if result.modified_count:
        return jsonify({'msg': 'License plate removed successfully'}), 200
    else:
        return jsonify({'msg': 'License plate not found or user not found'}), 400


@views.route('/user/license_plates', methods=['GET'])
@cross_origin()
@jwt_required()
def get_license_plates():
    user_id = get_jwt_identity()
    user = users_collection.find_one({'_id': user_id}, {'license_plates': 1, '_id': 0})

    if user:
        return jsonify({'license_plates': user.get('license_plates', [])}), 200
    else:
        return jsonify({'msg': 'User not found'}), 404


@views.route('/user/update_license_plate', methods=['POST'])
@cross_origin()
@jwt_required()
def update_license_plate():
    user_id = get_jwt_identity()
    data = request.get_json()
    old_plate = data['old_license_plate']
    new_plate = data['new_license_plate']

    result = users_collection.update_one(
        {'_id': user_id, 'license_plates': old_plate},
        {'$set': {'license_plates.$': new_plate}}
    )

    if result.modified_count:
        return jsonify({'msg': 'License plate updated successfully'}), 200
    else:
        return jsonify({'msg': 'Old license plate not found'}), 400


@views.route('/users', methods=['GET'])
@cross_origin()
def get_all_users():
    users = users_collection.find()
    users_list = []
    for user in users:
        user['_id'] = str(user['_id'])
        users_list.append(user)
    return jsonify(users_list)
