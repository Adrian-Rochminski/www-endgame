import React, { useState } from 'react';
import { AutoComplete } from 'primereact/autocomplete';

const MyParkingSearch = ({ parkings, onSelectParking }) => {
    const [filteredParkings, setFilteredParkings] = useState([]);
    const [selectedParking, setSelectedParking] = useState(null);

    const searchParking = (event) => {
        setTimeout(() => {
            let _filteredParkings;
            if (!event.query.trim().length) {
                _filteredParkings = [...parkings];
            } else {
                _filteredParkings = parkings.filter(parking => {
                    return parking.address.toLowerCase().startsWith(event.query.toLowerCase());
                });
            }

            setFilteredParkings(_filteredParkings);
        }, 250);
    };

    return (
        <div>
            <AutoComplete 
                value={selectedParking} 
                suggestions={filteredParkings} 
                completeMethod={searchParking} 
                field="address" 
                dropdown 
                onChange={(e) => {
                    console.log(e)
                    setSelectedParking(e.value);
                    const parking = parkings.find(p => p.address === e.value);
                    onSelectParking(parking);
                }}
                placeholder="Wyszukaj parking"
            />
        </div>
    );
};

export default MyParkingSearch;
