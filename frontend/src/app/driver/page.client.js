'use client'

import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../../components/Navbar';
import CreateUpdateDialog from '../../components/CreateUpdateDialog';
import ShowTicketDialog from '../../components/ShowTicketDialog';
import AddMoneyDialog from '../../components/AddMoneyDialog';
import ParkDialog from '../../components/ParkDialog';
import ParkingOSImage from "../../../public/ParkingOS_icon.png";
import axios from 'axios';
import { Card } from 'primereact/card';
import { MyPrimaryButton, MySecondaryButton, MyCollapseButton } from '../../components/MyButtons';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { ScrollPanel } from 'primereact/scrollpanel';
import { SERVER_ADDRESS } from '../../../utils/Links'
import { Toast } from 'primereact/toast';
import reload from '../../../utils/Reload'

export const Driver = (session) => {
    const [plates, setPlates] = useState([]);
    const [platesWithState, setPlatesWithState] = useState([]);
    const [userMoney, setUserMoney] = useState();

    const [visibleCUD, setVisibleCUD] = useState(false);
    const [visibleAM, setVisibleAM] = useState(false);
    const [visibleST, setVisibleST] = useState(false);
    const [visibleP, setVisibleP] = useState(false);
    const [selectedLicensePlate, setSelectedLicensePlate] = useState(null);

    const toast = useRef(null);

    let authHeader = {
        headers: {
            Authorization: "Bearer " + session.token.token
        }
    }


    // First request: Fetch plates
    useEffect(() => {
        axios.get(`${SERVER_ADDRESS}/user/license_plates`, authHeader)
          .then(response => {
            console.log(response.data);
            setPlates(response.data.license_plates)
          })
          .catch(error => {
            console.error('Error fetching data:', error);
          });
      }, []);

    // Second request: Fetch state for each plate
    useEffect(() => {
      if (plates && plates.length === 0) {
          return;
      }

      const fetchDataForPlate = async (plate) => {
          try {
              const response = await axios.get(`${SERVER_ADDRESS}/parking/check_plate/${plate}`, authHeader);
              console.log(response.data);
              return {
                  "license_plate": plate,
                  "is_occupied": response.status === 200 ? 1 : 0
              };
          } catch (error) {
              console.error('Error fetching data:', error);
              return {
                "license_plate": "Error ???",
                "is_occupied": Infinity
            };
          }
      };

      const fetchAllData = async () => {
          const allData = await Promise.all(plates.map(plate => fetchDataForPlate(plate)));  // get dicts with license and state
          const nonEmptyData = allData.filter(data => Object.keys(data).length > 0);  // filter empty dicts
          console.log(nonEmptyData.length);
          console.log(nonEmptyData);
          setPlatesWithState(nonEmptyData);
      };

      fetchAllData();
  }, [plates]); // Run when `plates` changes

    // Third request: Fetch plates
    useEffect(() => {
      axios.get(`${SERVER_ADDRESS}/user/money`, authHeader)
        .then(response => {
          console.log(response.data);
          setUserMoney(parseInt(response.data.money, 10));
        })
        .catch(error => {
          console.error('Error fetching data:', error);
          setUserMoney(Infinity);
        });
    }, []);



    const footer = (
        <>
            <MyPrimaryButton label="Dodaj nowy pojazd" onClick={() => edit(null)}/>
        </>
    );

    // Show edit dialog
    function edit(selectedLicensePlate){
        setSelectedLicensePlate(selectedLicensePlate);
        setVisibleCUD(true)
    }

    // Show ticket dialog
    function show(selectedLicensePlate){
      setSelectedLicensePlate(selectedLicensePlate);
      setVisibleST(true)
    }

    // Show parking dialog
    function park(selectedLicensePlate){
      setSelectedLicensePlate(selectedLicensePlate);
      setVisibleP(true)
    }

    // remove license plate from system
    function remove(selectedLicensePlate){
      axios.delete(`${SERVER_ADDRESS}/user/license_plate`, {
          headers: {
              Authorization: "Bearer " + session.token.token,
              license_plate: selectedLicensePlate
          }
      })
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

    function unpark(selectedLicensePlate){
      axios.post(`${SERVER_ADDRESS}/parking/unpark/${selectedLicensePlate}`, authHeader)
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
                <p className="m-0">Witaj: {session.user}</p>

                <p className="m-0">Twoje saldo: {userMoney}</p>
                <MySecondaryButton label="Doładuj konto" onClick={() => setVisibleAM(true)}/>
                <br></br>
                <br></br>
                
                <p className="m-0">Twoje samochody:</p>
                <ScrollPanel style={{ width: '400px', height: '300px' }}>
                  {platesWithState && platesWithState.length > 0 ? (
                    <>
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
                                            <MyCollapseButton label="Bilet" onClick={() => show(plate.license_plate)}/>
                                            <MyCollapseButton label="Wyjedź" onClick={() => unpark(plate.license_plate)}/>
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
                                            <MyCollapseButton label="Edytuj" onClick={() => edit(plate.license_plate)}/>
                                            <MyCollapseButton label="Zaparkuj" onClick={() => park(plate.license_plate)}/>
                                            <MyCollapseButton label="Usuń" onClick={() => remove(plate.license_plate)} />
                                        </p>
                                    </AccordionTab>
                                )
                            ))}
                        
                      </Accordion>
                      </div>
                    </>
                  ) : (
                    <p>Nie znaleziono żadnych pojazdów :(</p> // This is the message displayed when platesWithState is empty
                  )}
                </ScrollPanel>


            </Card>
          </div>



          <CreateUpdateDialog
                visible={visibleCUD}
                onHide={() => setVisibleCUD(false)}
                oldLicensePlate={selectedLicensePlate}
                token={session.token.token}
            />

          <AddMoneyDialog
                visible={visibleAM}
                onHide={() => setVisibleAM(false)}
                token={session.token.token}
            />

          <ShowTicketDialog
                visible={visibleST}
                onHide={() => setVisibleST(false)}
                licensePlate={selectedLicensePlate}
                token={session.token.token}
            />

          <ParkDialog
              visible={visibleP}
              onHide={() => setVisibleP(false)}
              licensePlate={selectedLicensePlate}
              token={session.token.token}
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