import React, { useState, useEffect, useRef } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { ScrollPanel } from 'primereact/scrollpanel';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import axios from 'axios';
import { SERVER_ADDRESS } from '../../utils/Links'
import reload from '../../utils/Reload'
import { MyPrimaryButton } from './MyButtons';

const ParkDialog = ({ visible, onHide, licensePlate, token }) => {
    const toast = useRef(null);
    const [parkings, setParkings] = useState([]);

    const config = {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };

    // Get list of existing parkings
    useEffect(() => {

        axios.get(`${SERVER_ADDRESS}/parking/parkings`, config)
          .then(response => {
            console.log(response.data);
            setParkings(response.data)
          })
          .catch(error => {
            console.error('Error fetching data:', error);
          });
      }, []);
    if (!parkings) { return <p>Waiting for parkings ...</p>; }

    // Parking request
    const select_parking = (parking_id) => {
        let request = {
            "plate": licensePlate,
            "parking_id": parking_id
        }
        
        axios.post(`${SERVER_ADDRESS}/parking/park`, request, config)
          .then(response => {
            console.log(response.data);
            toast.current.show({ severity: 'success', summary: 'Sukces', detail: `${JSON.stringify(request)}`, life: 3000 });
          })
          .catch(error => {
            console.error('Error fetching data:', error);
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
                                return(
                                    <AccordionTab 
                                        header={
                                            <div className="flex align-items-center gap-2 w-full">
                                                <span className="font-bold white-space-nowrap">{parking.address}</span>
                                            </div>
                                        } 
                                        key={parking._id}
                                    >
                                        <div>
                                            <h5><b>Dane podstawowe</b></h5>
                                            <p>Taryfa 1: {parking.day_rate}</p>
                                            <p>Taryfa 2: {parking.night_rate}</p>
                                            <p>Początek dnia: {parking.day_time_start}</p>
                                            <p>Koniec dnia: {parking.day_time_end}</p>
                                            {parking.extra_rules && (
                                                <>
                                                    <h5><b>Dane dodatkowe</b></h5>
                                                    <p>Pierwsza godzina: {parking.extra_rules.first_hour}</p>
                                                    <p>Następne 6 godzin: {parking.extra_rules.rate_from_six_hours}</p>
                                                </>
                                            )}
                                            <MyPrimaryButton label="Wybierz" onClick={() => select_parking(parking._id)}/>
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