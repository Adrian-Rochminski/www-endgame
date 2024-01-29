'use client'

import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../../components/Navbar';
import axios from 'axios';
import CreateUpdateParkingDialog from '../../components/CreateUpdateParkingDialog';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { ScrollPanel } from 'primereact/scrollpanel';
import { SERVER_ADDRESS } from '../../../utils/Links'
import { Toast } from 'primereact/toast';
import reload from '../../../utils/Reload'
import dummyParkingsData2 from '../../dummyData/dummyParkingsData2.json';
import { useRouter } from "next/navigation";

export default function Owner() {
    const [parkings, setParkings] = useState([]);
    const dummyUserData = {
      "_id": "a61f338f-5651-47cf-ae44-5eee67b825cc",
      "username": "owner_user"
    }
    const [visibleCUPD, setVisibleCUPD] = useState(false);
    const [selectedParking, setSelectedParking] = useState(null);
    const router = useRouter();

    const toast = useRef(null);

    // First request: Fetch parkings
    useEffect(() => {
        axios.get(`${SERVER_ADDRESS}/parking/parkings`)
          .then(response => {
            console.log(response.data);
            setParkings(response.data)
          })
          .catch(error => {
            console.error('Error fetching data 1:', error);
            setParkings(dummyParkingsData2)
          });
      }, []);
    if (!parkings) { return <p>Waiting for parkings ...</p>; }

    const footer = (
        <>
            <Button label="Dodaj nowy parking" onClick={() => edit(null)}/>
        </>
    );

    // Show edit dialog
    function edit(selectedParking){
        setSelectedParking(selectedParking);
        setVisibleCUPD(true)
    }

    function liveView(selectedParking){
      console.log(selectedParking);
      router.push("/owner/live_view?data=" + JSON.stringify(selectedParking));
    }

    // remove parking from system
    function remove(selectedParking){
      axios.delete(`${SERVER_ADDRESS}/parking/parking`, {"parking_id": selectedParking._id})
      .then(response => {
        console.log(response.data);
        toast.current.show({ severity: 'success', summary: 'Sukces', detail: `${JSON.stringify(response.data)}`, life: 3000 });
      })
      .catch(error => {
        console.error('Error fetching data 1:', error);
        toast.current.show({ severity: 'error', summary: 'Błąd', detail: `${error}`, life: 3000 });
      });
      reload(3000);
    }

    return (
        <div className="Owner" style={style}>
          <Navbar />
          <div className="card flex justify-content-center mt-10" style={card_style}>
            <Card title="Karta Właściciela" subTitle="" footer={footer} className="md:w-25rem">
                <p className="m-0">Witaj: {dummyUserData.username}</p>

                <p className="m-0">Twoje parkingi:</p>
                <ScrollPanel style={{ width: '400px', height: '300px' }}>
                  <div className="card">
                  <Accordion activeIndex={0}>
                    {parkings.map((parking, index) => (
                        <AccordionTab 
                            header={
                                <span className="flex align-items-center gap-2 w-full">
                                    <span className="font-bold white-space-nowrap">{parking.address}</span>
                                </span>
                            } 
                            key={index}
                        >
                            <p className="m-0">
                                    <Button label="Edytuj" onClick={() => edit(parking)}/>
                                    <Button label="Usuń" style={{ marginLeft: '0.5em' }} onClick={() => remove(parking)} />
                                    <Button label="Podgląd" style={{ marginLeft: '0.5em' }} onClick={() => liveView(parking)} />
                                </p>
                        </AccordionTab>
                    ))}
                </Accordion>

                  </div>
                </ScrollPanel>
                
            </Card>
          </div>


          <CreateUpdateParkingDialog 
                visible={visibleCUPD} 
                onHide={() => setVisibleCUPD(false)} 
                oldParking={selectedParking}
            />

          <Toast ref={toast} />

        </div>

      
    );
}

const style = {
    width: "100vw",
    height: "100vh",
}

const card_style = {
  display: "flex",
  alignItems: 'center',
  justifyContent: 'center'
}
