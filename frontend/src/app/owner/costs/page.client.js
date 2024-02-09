"use client"
import { useRouter } from "next/navigation";
import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../../../components/Navbar';
import axios from 'axios';
import { Card } from 'primereact/card';
import { MyPrimaryButton, MySecondaryButton, MyCollapseButton } from '../../../components/MyButtons';
import { CreateUpdateCostDialog } from '../../../components/CreateUpdateCostDialog';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { ScrollPanel } from 'primereact/scrollpanel';
import { SERVER_ADDRESS } from '../../../../utils/Links'
import { Toast } from 'primereact/toast';
import reload from '../../../../utils/Reload'
import { TabView, TabPanel } from 'primereact/tabview';
import { Tooltip } from 'primereact/tooltip';
import ParkingSpotDetailsDialog from '../../../components/ParkingSpotDetailsDialog'; 
import Image from 'next/image'

export const Costs = (session) => {
    const router = useRouter();
    const [parkingId, setParkingId] = useState('')
    const [parkingAddress, setParkingAddress] = useState('')
    const [costs, setCosts] = useState([])
    const [selectedCost, setSelectedCost] = useState({})
    const [visibleCreateUpdateCostDialog, setVisibleCreateUpdateCostDialog] = useState(false)

    const toast = useRef(null);

    let authHeader = {
        headers: {
            Authorization: "Bearer " + session.token.token
        }
    }

    // get parking id and address from browser header
    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const data = queryParams.get('data');
        if (data) {
          console.log(data);
          try {
            const jsonData = JSON.parse(data);
            setParkingId(jsonData["id"]);
            setParkingAddress(jsonData["address"]);
          } catch (error) {
            console.error("Error parsing JSON:", error);
          }
        }
      }, [router.query]);

      // load existing costs
      useEffect(() => {
        console.log("here costs -> " + parkingId)
        if (parkingId) {
            axios.get(`${SERVER_ADDRESS}/parking/costs/${parkingId}`, authHeader)
            .then(response => {
                console.log(response.data);
                console.log(response.data.costs);
                setCosts(response.data.costs);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
        }
      }, [parkingId]);

    
    // Implemented
    function liveView(){
        router.push("/owner/live_view?id=" + JSON.stringify(parkingId));
    }

    // Not implemented
    function statistics(){
        router.push("/owner/stats");
    }


    // Show edit dialog
    function edit(selectedCost){
        console.log(selectedCost);
        setSelectedCost(selectedCost);
        setVisibleCreateUpdateCostDialog(true);
    }

    // remove cost from system
    function remove(selectedCost){
        const request = {
            'parking_id': parkingId,
            'cost_id': selectedCost._id
        }
        console.log(request);

        axios.delete(`${SERVER_ADDRESS}/costs/delete`, request, authHeader)
        .then(response => {
          console.log(response.data);
          toast.current.show({ severity: 'success', summary: 'Sukces', detail: `${JSON.stringify(response.data)}`, life: 3000 });
        })
        .catch(error => {
          console.error('Error fetching data 1:', error);
          toast.current.show({ severity: 'error', summary: 'Błąd', detail: `${error}`, life: 3000 });
        });
        //reload(3000);
      }

    return (
        <div className="Costs" style={style}>
          <Navbar />
          <div className="card flex justify-content-center mt-10" style={card_style}>
              <Card title={"Koszty parkingu: " + parkingAddress} subTitle="" className="md:w-75rem">

                    <MyPrimaryButton label="Podgląd" style={{ marginLeft: '0.5em' }} onClick={() => liveView()}/>
                    <MySecondaryButton label="Statystyki" style={{ marginLeft: '0.5em' }} onClick={() => stats()}/>
                    <br></br><br></br>

                <ScrollPanel style={{ width: '600px', height: '600px' }}>

                    <div className="card">
                        <Accordion activeIndex={0}>
                            
                                {costs.map((cost, index) => (
                                    <AccordionTab
                                        header={
                                            <span className="flex align-items-center gap-2 w-full">
                                                <span className="font-bold white-space-nowrap">{cost.name}</span>
                                                {cost.periodic ? (<Image src="/periodic.svg" alt="periodic" width={20} height={20} priority />) : ("")}
                                            </span>
                                        }
                                        key={index}
                                    >
                                        <p className="m-0">
                                            <div key={index} style={{ paddingBottom: '10px' }}>
                                                <strong>Cena:</strong> {cost.price}<br />
                                                <strong>Początek usługi:</strong> {cost.start_date}<br />
                                                <strong>Koniec usługi:</strong> {cost.end_date ? cost.end_date : "Usługa jest cykliczna"}<br />
                                            </div>
                                            <MyCollapseButton label="Edytuj" onClick={() => edit(cost)}/>
                                            <MyCollapseButton label="Usuń" onClick={() => remove(cost)}/>
                                        </p>
                                    </AccordionTab>
                                ))}
                            
                        </Accordion>
                    </div>

                </ScrollPanel>

                    <MyPrimaryButton label="Dodaj nowe koszty" onClick={() => edit(null)}/>

            </Card>
          </div>


          <CreateUpdateCostDialog
            visible={visibleCreateUpdateCostDialog}
            onHide={() => setVisibleCreateUpdateCostDialog(false)}
            oldCost={selectedCost}
            parkingId={parkingId}
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
