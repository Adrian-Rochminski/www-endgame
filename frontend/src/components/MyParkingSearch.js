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

    const scopedStyle = `
        .my-parking-search .p-inputtext:focus, .my-parking-search button:focus, .my-parking-search .p-button:focus {
            outline: none !important;
            box-shadow: none !important;
        }
    `;

    return (
        <div className="my-parking-search">
            <style>
                {scopedStyle}
            </style>
            <AutoComplete 
                value={selectedParking} 
                suggestions={filteredParkings} 
                completeMethod={searchParking} 
                field="address" 
                dropdown 
                onChange={(e) => {
                    const value = e.value;
                    setSelectedParking(typeof value === 'object' ? value.address : value);
                    const parking = typeof value === 'object' ? value : parkings.find(p => p.address === value);
                    if (parking) {
                        onSelectParking(parking);
                    }
                }}
                placeholder="Łódź"
            />
        </div>
    );
};

export default MyParkingSearch;
