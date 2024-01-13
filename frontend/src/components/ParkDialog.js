import React, { useState, useEffect, useRef } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { ScrollPanel } from 'primereact/scrollpanel';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { Formik, Field, Form } from 'formik';
import axios from 'axios';
import { SERVER_ADDRESS } from '../../utils/Links'
import reload from '../../utils/Reload'

import dummyParkingsData from './dummyParkingsData.json';

const ParkDialog = ({ visible, onHide, licensePlate }) => {
    const toast = useRef(null);
    const [parkings, setParkings] = useState([]);

    useEffect(() => {
        axios.get(`${SERVER_ADDRESS}/parking/parkings`)
          .then(response => {
            console.log(response.data);
            setParkings(response.data)
          })
          .catch(error => {
            console.error('Error fetching data 1:', error);
            setParkings(dummyParkingsData)
          });
      }, []);
    if (!parkings) { return <p>Waiting for parkings ...</p>; }

    function calculateParkingStats(data) {
        let totalPlacesPerFloor = {};
        let freePlacesPerFloor = {};
        data.spots.forEach(spot => {
            let floor = spot.floor;
            if (!totalPlacesPerFloor.hasOwnProperty(floor)) {
                totalPlacesPerFloor[floor] = 0;
                freePlacesPerFloor[floor] = 0;
            }
            totalPlacesPerFloor[floor]++;
            if (spot.available) {
                freePlacesPerFloor[floor]++;
            }
        });
        let parkingStats = {};
        for (let floor in totalPlacesPerFloor) {
            parkingStats[floor] = {
                free: freePlacesPerFloor[floor] || 0,
                total: totalPlacesPerFloor[floor]
            };
        }
        return parkingStats;
    }

    function getAccordionColor(stats) {
        let free = 0
        let total = 0
        for (const [key, value] of Object.entries(stats)) {
            free += value.free;
            total += value.total;
        }
        const percentage = free / total * 100;
        if (percentage > 50) return "green";
        else if (percentage > 25) return "orange";
        else if (percentage > 0) return "red"
        else return "gray"
    }

    const select_parking = (parking_id) => {
        let request = {
            "plate": {licensePlate},
            "parking_id": {parking_id}
        }
        axios.put(`${SERVER_ADDRESS}/parking/park`, request)
          .then(response => {
            console.log(response.data);
            toast.current.show({ severity: 'success', summary: 'Sukces', detail: `${JSON.stringify(request)}`, life: 3000 });
          })
          .catch(error => {
            console.error('Error fetching data 1:', error);
            toast.current.show({ severity: 'error', summary: 'Błąd', detail: `${JSON.stringify(request)} - ${error}`, life: 3000 });
          });
          reload(3000);
    };

    return (
        <>
            <Toast ref={toast} />
            <Dialog 
                visible={visible} 
                onHide={onHide}
                header="Zaparkuj"
                icon="pi pi-exclamation-triangle" 
            >
                <div>

                <ScrollPanel style={{ width: '400px', height: '300px' }}>
                    <div className="card">
                        <Accordion>
                            {parkings.map((parking, index) => {

                                const stats = calculateParkingStats(parking);
                                const statsColor = getAccordionColor(stats);

                                return(
                                    <AccordionTab 
                                        header={
                                            <div style={{"color": statsColor}} className="flex align-items-center gap-2 w-full">
                                                <span className="font-bold white-space-nowrap">{parking.address}</span>
                                            </div>
                                        } 
                                        key={parking._id}
                                        disabled={statsColor == "gray"}
                                    >
                                        <div>
                                            <h5><b>Basic:</b></h5>
                                            <p>day_rate: {parking.day_rate}</p>
                                            <p>night_rate: {parking.night_rate}</p>
                                            <p>day_time_end: {parking.day_time_end}</p>
                                            <p>day_time_start: {parking.day_time_start}</p>
                                            {parking.extra_rules && (
                                                <>
                                                    <h5><b>Extra rules:</b></h5>
                                                    <p>first_hour: {parking.extra_rules.first_hour}</p>
                                                    <p>rate_from_six_hours: {parking.extra_rules.rate_from_six_hours}</p>
                                                </>
                                            )}
                                            <div>
                                                <h5><b>Statistics:</b></h5>
                                                {Object.entries(stats).map(([floor, stats]) => (
                                                    <p key={floor}>Floor {floor} - Free: {stats.free}, Total: {stats.total}</p>
                                                ))}
                                            </div>
                                            <Button label="Wybierz" onClick={() => select_parking(parking._id)} />
                                        </div>
                                    </AccordionTab>
                                )
                            })}
                        </Accordion>
                    </div>
                </ScrollPanel>

                    
                    </div>
            </Dialog>
        </>
    );
};

export default ParkDialog;