"use client"
import { useRouter } from "next/navigation";
import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../../../components/Navbar';
import axios from 'axios';
import { Card } from 'primereact/card';
import { MyPrimaryButton, MySecondaryButton } from '../../../components/MyButtons';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { ScrollPanel } from 'primereact/scrollpanel';
import { SERVER_ADDRESS } from '../../../../utils/Links'
import { Toast } from 'primereact/toast';
import reload from '../../../../utils/Reload'
import { TabView, TabPanel } from 'primereact/tabview';

export default function LiveView() {
    const router = useRouter();
    const [parking, setParking] = useState([]);
    const [stats, setStats] = useState([]);
    const getColor = (available) => available ? '#24D4A8' : '#EA526F';

    const dummyData = {
        "_id": "276c3fb1-98c4-1142-842a-64fbad65ab21",
        "address": "Łódź, Radwańska 20",
        "day_rate": 1.5,
        "day_time_end": "20:00",
        "day_time_start": "10:00",
        "night_rate": 2.3,
        "owner_id": "856316f2-e55e-4383-bf82-330195b89321",
        "spots": [
            {"available": false, "floor": 0, "spot": 0},
            {"available": true, "floor": 0, "spot": 1},
            {"available": true, "floor": 1, "spot": 0},
            {"available": false, "floor": 1, "spot": 1}
        ]
    }

    // endpoint not implemented
    useEffect(() => {
        axios.get(`${SERVER_ADDRESS}/parking/parkind_details/<address>`)
          .then(response => {
            console.log(response.data);
            setParking(response.data)
          })
          .catch(error => {
            console.error('Error fetching data 1:', error);
            setParking(dummyData)
            const cc = calculateParkingStats(dummyData)
            setStats(cc)
          });
      }, []);
    if (!parking || !stats) { return <p>Waiting for parking ...</p>; }

      // Calculate capacity of parking
    function calculateParkingStats(data) {
        console.log(data);
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


    function costs(){
        // Not implemented
        router.push("/owner/costs");
    }

    function statistics(){
        // Not implemented
        router.push("/owner/stats");
    }


    return (
        <div className="LiveView" style={style}>
          <Navbar />
          <div className="card flex justify-content-center mt-10" style={card_style}>
              <Card title={"Parking: " + parking.address} subTitle="" className="md:w-75rem">

                <MyPrimaryButton label="Koszta" style={{ marginLeft: '0.5em' }} onClick={() => costs()}/>
                <MySecondaryButton label="Statystyki" style={{ marginLeft: '0.5em' }} onClick={() => stats()}/>

                <ScrollPanel style={{ width: '600px', height: '600px' }}>
                    <TabView scrollable>
                        {Object.entries(stats).map(([floor, stats]) => (
                            <TabPanel key={floor} header={"Poziom:" + floor}>
                                <p key={floor}>Wolne: {stats.free}, Całość: {stats.total}</p>
                                <div>
                                    {parking.spots
                                        .filter(spot => spot.floor.toString() === floor)
                                        .map((spot, index) => (
                                            <React.Fragment key={index}>
                                                {index % 3 === 0 && index !== 0 && <div style={{ clear: 'both' }}></div>}
                                                <div style={{
                                                    width: '150px',
                                                    height: '200px',
                                                    backgroundColor: getColor(spot.available),
                                                    float: 'left',
                                                    margin: '5px',
                                                    textAlign: 'center',
                                                    lineHeight: '200px',
                                                    borderRadius: '10px'
                                                }}>
                                                    Miejsce {spot.spot}
                                                </div>
                                            </React.Fragment>
                                        ))
                                    }
                                </div>
                            </TabPanel>
                        ))}
                    </TabView>

                </ScrollPanel>

            </Card>
          </div>

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
