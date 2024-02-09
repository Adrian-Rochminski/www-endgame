from website import db


def wypisz_dane_kolekcji(nazwa_kolekcji):
    kolekcja = db[nazwa_kolekcji]
    print(f"Dane z kolekcji '{nazwa_kolekcji}':")
    for rekord in kolekcja.find():
        print(rekord)

wypisz_dane_kolekcji('users')
wypisz_dane_kolekcji('parkings')


def zmien_status_owner(id_uzytkownika):
    kolekcja = db['users']
    wynik = kolekcja.update_one({"_id": id_uzytkownika}, {"$set": {"is_owner": True}})
    if wynik.matched_count > 0:
        print(f"Zaktualizowano status właściciela dla użytkownika o ID {id_uzytkownika}.")
    else:
        print(f"Nie znaleziono użytkownika o ID {id_uzytkownika}.")


