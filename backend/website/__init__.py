from flask import Flask
from pymongo import MongoClient, server_api
from flask_jwt_extended import JWTManager
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'
app.config['JWT_SECRET_KEY'] = 'www-secret-key-to-jwt-tokens'
jwt = JWTManager(app)
MONGODB_URI = "mongodb+srv://Adrian:Korsarz29@parkinglotdatabase.urd7nin.mongodb.net/?retryWrites=true&w=majority"
client = MongoClient(MONGODB_URI, server_api=server_api.ServerApi('1'))
db = client['parkinglotdatabase']
users_collection = db['users']
parkings_collection = db['parkings']

try:
    client.admin.command('ping')
    print("Pinged your deployment. You successfully connected to MongoDB!")
except Exception as e:
    print(e)


##data example

# user_id = ObjectId()
# users_collection.insert_one({
#     '_id': user_id,
#     'username': 'jan_kowalski',
#     'password': 'secretPassword123',
#     'license_plates': ['DW12345', 'DW67890'],
#     'is_owner': True,
#     'money': 21.37
# })
#
# parking_id = ObjectId()
# parkings_collection.insert_one({
#     '_id': parking_id,
#     'owner_id': user_id,
#     'address': 'Central Parking',
#     'spots': [
#         {'spot': 1, 'available': True},
#         {'spot': 2, 'available': False}
#     ],
#     "day_time_start": time as str,
#     "day_time_end": time as str,
#     'night_rate': 5.0,
#     'day_rate': 10.0,
#     'current_usage': [
#         {'license_plate': 'DW67890', 'start_date': datetime.now(), 'end_date': None, 'paid': 0.0}
#     ]
#     'history': [
#         {'license_plate': 'DW67890', 'start_date': datetime.now(), 'end_date': some_datetime, 'paid': 0.0}
#     ]
# })

def create_app():
    app = Flask(__name__)

    from .views import views
    from .parking import parking

    app.register_blueprint(views, url_prefix='/')
    app.register_blueprint(parking, url_prefix='/parking')
    app.config['JWT_SECRET_KEY'] = 'www-secret-key-to-jwt-tokens'
    jwt = JWTManager(app)
    return app
