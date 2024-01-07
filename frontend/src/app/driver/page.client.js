'use client'

import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../../components/Navbar';
import CreateUpdateDialog from '../../components/CreateUpdateDialog';
import ShowTicketDialog from '../../components/ShowTicketDialog';
import AddMoneyDialog from '../../components/AddMoneyDialog';
import ParkingOSImage from "../../../public/ParkingOS_icon.png";
import axios from 'axios';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { ScrollPanel } from 'primereact/scrollpanel';
import { SERVER_ADDRESS } from '../../../utils/Links'
import { Toast } from 'primereact/toast';
import reload from '../../../utils/Reload'

export default function Driver() {
    const [plates, setPlates] = useState([]);
    const [platesWithState, setPlatesWithState] = useState([]);
    const dummyUserData = {
      "_id": "a61f338f-5651-47cf-ae44-5eee67b825cc",
      "license_plates": ["VFK-8994", "RWM-9308", "GVU-1723", "NAP-0519", "YIU-5170", "ZRH-3452", "BTD-4765", "TUT-3628", "OHL-5890", "XYZ-6003"],
      "money": 0.0,
      "username": "nowy_uzytkownik"
    }

    const [visibleCUD, setVisibleCUD] = useState(false);
    const [visibleAM, setVisibleAM] = useState(false);
    const [visibleST, setVisibleST] = useState(false);
    const [selectedLicensePlate, setSelectedLicensePlate] = useState(null);

    const toast = useRef(null);

    // First request: Fetch plates
    useEffect(() => {
        axios.get(`${SERVER_ADDRESS}/user/${dummyUserData._id}/license_plates`)
          .then(response => {
            console.log(response.data);
            setPlates(response.data.license_plates)
          })
          .catch(error => {
            console.error('Error fetching data 1:', error);
            setPlates(dummyUserData.license_plates)
          });
      }, []);
    if (!plates) { return <p>Waiting for plates ...</p>; }

    // Second request: Fetch state for each plate
    useEffect(() => {
      if (plates.length === 0) {
          return;
      }

      const fetchDataForPlate = async (plate) => {
          try {
              const response = await axios.get(`${SERVER_ADDRESS}/find_license_plate/${plate}`);
              console.log(response.data);
              return {
                  "license_plate": plate,
                  "is_occupied": response.data.state
              };
          } catch (error) {
              console.error('Error fetching data 2:', error);
              return {
                  "license_plate": plate,
                  "is_occupied": Math.round(Math.random())
              };
          }
      };

      const fetchAllData = async () => {
          const allData = await Promise.all(plates.map(plate => fetchDataForPlate(plate)));
          setPlatesWithState(allData);
      };

      fetchAllData();
  }, [plates]); // Run when `plates` changes
  if (!platesWithState || plates.length != platesWithState.length) { return <p>Waiting for plates state ...</p>; }

    const footer = (
        <>
            <Button label="Dodaj nowy pojazd" onClick={() => edit(null)}/>
        </>
    );

    function edit(selectedLicensePlate){
        setSelectedLicensePlate(selectedLicensePlate);
        setVisibleCUD(true)
    }

    function show(selectedLicensePlate){
      setSelectedLicensePlate(selectedLicensePlate);
      setVisibleST(true)
    }

    function remove(selectedLicensePlate){
      axios.post(`${SERVER_ADDRESS}/user/${dummyUserData._id}/license_plate`, {"license_plate": selectedLicensePlate})
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

    function updateLicensePlateStatus(is_occupied){
      const request = {
        "license_plate": selectedLicensePlate,
        "is_occupied": is_occupied
      } 
      axios.post(`${SERVER_ADDRESS}/user/${dummyUserData._id}/license_plate_status`, request)
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
        <div className="Driver" style={style}>
          <Navbar />
          <div className="card flex justify-content-center mt-10" style={card_style}>
            <Card title="Karta Kierowcy" subTitle="" footer={footer} className="md:w-25rem">
                <p className="m-0">Witaj: {dummyUserData.username}</p>

                <p className="m-0">Twoje saldo: {dummyUserData.money}</p>
                <Button label="Doładuj konto" onClick={() => setVisibleAM(true)}/>

                <p className="m-0">Twoje samochody:</p>
                <ScrollPanel style={{ width: '400px', height: '300px' }}>
                  <div className="card">
                  <Accordion activeIndex={0}>
                    {platesWithState.map((plate, index) => (
                        plate.is_occupied ? (
                            <AccordionTab 
                                header={
                                    <span className="flex align-items-center gap-2 w-full">
                                        <span className="font-bold white-space-nowrap">{plate.license_plate}</span>
                                        <img alt="ParkingOS" src={ParkingOSImage.src} style={navbar_img_style} className="mr-2"></img>
                                    </span>
                                } 
                                key={index}
                            >
                                <p className="m-0">
                                    <Button label="Bilet" onClick={() => show(plate.license_plate)}/>
                                    <Button label="Wyjedź" style={{ marginLeft: '0.5em' }} onClick={() => updateLicensePlateStatus(0)}/>
                                </p>
                            </AccordionTab>
                        ) : (
                            <AccordionTab 
                                header={
                                    <span className="flex align-items-center gap-2 w-full">
                                        <span className="font-bold white-space-nowrap">{plate.license_plate}</span>
                                    </span>
                                } 
                                key={index}
                            >
                                <p className="m-0">
                                    <Button label="Edytuj" onClick={() => edit(plate.license_plate)}/>
                                    <Button label="Zaparkuj" style={{ marginLeft: '0.5em' }} onClick={() => updateLicensePlateStatus(1)}/>
                                    <Button label="Usuń" style={{ marginLeft: '0.5em' }} onClick={() => remove(plate.license_plate)} />
                                </p>
                            </AccordionTab>
                        )
                    ))}
                </Accordion>

                  </div>
                </ScrollPanel>
                
            </Card>
          </div>

          
        
          <CreateUpdateDialog 
                visible={visibleCUD} 
                onHide={() => setVisibleCUD(false)} 
                oldLicensePlate={selectedLicensePlate}
            />

          <AddMoneyDialog 
                visible={visibleAM} 
                onHide={() => setVisibleAM(false)}
            />

          <ShowTicketDialog 
                visible={visibleST} 
                onHide={() => setVisibleST(false)}
                licensePlate={selectedLicensePlate}
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

const driver_style = {
  backgroundColor: "#fff",
  color: "#000",
  margin: "auto",
}

const navbar_img_style = {
  width: '25px',
}