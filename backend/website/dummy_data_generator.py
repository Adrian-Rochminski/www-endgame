from pymongo import MongoClient
import uuid
import random
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash

from website import db
users_collection = db['users']
parkings_collection = db['parkings']

db['users'].delete_many({})
db['parkings'].delete_many({})

def wypisz_dane_kolekcji(nazwa_kolekcji):
    kolekcja = db[nazwa_kolekcji]
    print(f"Dane z kolekcji '{nazwa_kolekcji}':")
    for rekord in kolekcja.find():
        print(rekord)

wypisz_dane_kolekcji('users')
wypisz_dane_kolekcji('parkings')


def wygeneruj_historie_parkowania(użytkownicy, liczba_rekordów, zajete_tablice):
    historia = []
    for _ in range(liczba_rekordów):
        użytkownik = random.choice(użytkownicy)
        dostępne_tablice = [p for p in użytkownik['license_plates'] if p not in zajete_tablice]

        # Sprawdzenie, czy istnieją jakiekolwiek dostępne tablice
        if dostępne_tablice:
            plate = random.choice(dostępne_tablice)
        else:
            # Jeśli nie ma dostępnych tablic, przypisz domyślną wartość
            plate = 'XYZ000'

        zajete_tablice.add(plate)
        start_date = datetime.now() - timedelta(days=random.randint(1, 30), hours=random.randint(1, 24))
        end_date = start_date + timedelta(hours=random.randint(1, 24))
        occupied_floor = random.randint(1, 5)
        occupied_spot = random.randint(1, 10)
        fee = round(random.uniform(10, 50), 2)

        history_record = {
            "license_plate": plate,
            "start_date": start_date,
            "end_date": end_date,
            "floor": occupied_floor,
            "spot": occupied_spot,
            "paid": fee
        }
        historia.append(history_record)
    return historia

użytkownicy = []
for i in range(50):
    new_user = {
        '_id': str(uuid.uuid4()),
        'username': f'user_{i + 1}',
        'password': generate_password_hash('password', method='sha256'),
        'license_plates': [f'XYZ{random.randint(100, 999)}'],
        'is_owner': False,
        'money': round(random.uniform(100, 1000), 2)
    }
    użytkownicy.append(new_user)



parkingi = []
owner_ids = random.sample([u['_id'] for u in użytkownicy], 6)
zajete_tablice = set()

for i, owner_id in enumerate(owner_ids):
    spots = [{'floor': floor, 'spot': spot, 'available': random.choice([True, False])} for floor in range(1, 6) for spot in range(1, 11)]
    zajete_tablice = set()
    occupied_spots = random.sample(spots, k=random.randint(1, len(spots) // 2))

    current_usage = []
    for _ in range(random.randint(10, 30)):  # Losowa liczba zajętych miejsc
        użytkownik = random.choice(użytkownicy)
        if użytkownik['license_plates']:
            plate = użytkownik['license_plates'][0]  # Zakładamy, że użytkownik ma przynajmniej jedną tablicę
            if plate not in zajete_tablice:
                zajete_tablice.add(plate)
                spot = random.choice(spots)
                spot['available'] = False  # Zajmowanie miejsca
                current_usage.append({
                    "floor": spot['floor'],
                    "spot": spot['spot'],
                    "car": plate,
                    "start_time": datetime.now() - timedelta(days=random.randint(1, 7)),
                    "end_time": None
                })

    historia = wygeneruj_historie_parkowania(użytkownicy, 30, zajete_tablice)

    for użytkownik in użytkownicy:
        if użytkownik['_id'] == owner_id:
            użytkownik['is_owner'] = True

    new_parking = {
        "_id": str(uuid.uuid4()),
        "owner_id": owner_id,
        "address": f"Address {i + 1}, City {random.randint(1, 100)}",
        "spots": spots,
        "current_usage": current_usage,
        "history": historia,
        "day_rate": round(random.uniform(1.0, 3.0), 2),
        "night_rate": round(random.uniform(0.5, 2.5), 2),
        "day_time_start": "07:00",
        "day_time_end": "19:00",
        "extra_rules": {
            "first_hour": random.choice([None, round(random.uniform(0.1, 2.0), 2)]),
            "rate_from_six_hours": random.choice([None, round(random.uniform(0.1, 2.0), 2)])
        }
    }
    parkingi.append(new_parking)

print(użytkownicy)
print(parkingi)

users_collection.insert_many(użytkownicy)
parkings_collection.insert_many(parkingi)

print(f"Dodano {len(użytkownicy)} użytkowników i {len(parkingi)} parkingów do bazy danych.")
