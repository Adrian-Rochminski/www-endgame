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
import { Tooltip } from 'primereact/tooltip';
import ParkingSpotDetailsDialog from '../../../components/ParkingSpotDetailsDialog'; 

export const LiveView = (session) => {
    const router = useRouter();
    const [parkingId, setParkingId] = useState('')
    const [parking, setParking] = useState([]);
    const [stats, setStats] = useState([]);
    const getColor = (available) => available ? '#24D4A8' : '#EA526F';
    const [dialogVisible, setDialogVisible] = useState(false);
    const [selectedSpotHistory, setSelectedSpotHistory] = useState([]);
    const [selectedSpotCurrentUsage, setSelectedSpotCurrentUsage] = useState([]);

    let authHeader = {
        headers: {
            Authorization: "Bearer " + session.token.token
        }
    }

    // get parking id from browser header
    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const id = queryParams.get('id');
        if (id) {
          console.log(id);
          const formattedId = id.replace(/^"|"$/g, '');
          console.log(formattedId);
          setParkingId(formattedId);
        }
      }, [router.query]);

    useEffect(() => {
        console.log("here -> " + parkingId)
        if (parkingId) {
            axios.get(`${SERVER_ADDRESS}/parking/parking_details/${parkingId}`, authHeader)
            .then(response => {
                console.log(response.data);
                setParking(response.data)
                const cc = calculateParkingStats(response.data)
                setStats(cc)
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
        }
      }, [parkingId]);
    if (!parking || !stats) { return <p>Waiting for parking ...</p>; }

      // Calculate capacity of parking
    function calculateParkingStats(data) {
        //console.log(data);
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

    // adjust history
    function formatHistoryForSpot(floor, spot, history) {
        const spotHistory = history.filter(h => h.floor === floor && h.spot === spot);
        if (spotHistory.length === 0) {
            return [{ message: 'Brak historii dla tego miejsca.' }];
        }
        return spotHistory.map(h => ({
            licensePlate: h.license_plate,
            paid: h.paid,
            start: new Date(h.start_date).toLocaleString(),
            end: h.end_date ? new Date(h.end_date).toLocaleString() : 'Ongoing'
        }));
    }
    

    const onSpotClick = (floor, spot) => {
        const history = formatHistoryForSpot(floor, spot, parking.history);
        const currentUsage = parking.current_usage.filter(usage => usage.floor === floor && usage.spot === spot);
        setSelectedSpotHistory(history);
        setSelectedSpotCurrentUsage(currentUsage);
        setDialogVisible(true);
    };

    function costs(){
        console.log({"id": parkingId, "address": parking.address});
        router.push("/owner/costs?data=" + JSON.stringify({"id": parkingId, "address": parking.address}));
    }

    function summary(){
        router.push("/owner/summary?data=" + JSON.stringify({"id": parkingId, "address": parking.address}));
    }


    return (
        <div className="LiveView" style={style}>
          <Navbar />
          <div className="card flex justify-content-center mt-10" style={card_style}>
              <Card title={"Parking: " + parking.address} subTitle="" className="md:w-75rem">

                <MyPrimaryButton label="Koszta" style={{ marginLeft: '0.5em' }} onClick={() => costs()}/>
                <MySecondaryButton label="Podsumowanie" style={{ marginLeft: '0.5em' }} onClick={() => summary()}/>
                <br></br><br></br>

                <ScrollPanel style={{ width: '600px', height: '600px' }}>
                    <TabView scrollable>
                        {Object.entries(stats).map(([floor, stats]) => (
                            <TabPanel key={floor} header={"Poziom:" + floor}>
                                <p key={floor}><b>Wolne: {stats.free}, Całość: {stats.total}, Dzisiejszy dochód: {30}</b></p>
                                <br></br>
                                <div>
                                    {parking.spots
                                        .filter(spot => spot.floor.toString() === floor)
                                        .map((spot, index) => (
                                            <React.Fragment key={index}>
                                                {index % 3 === 0 && index !== 0 && <div style={{ clear: 'both' }}></div>}
                                                <div
                                                    onClick={() => onSpotClick(spot.floor, spot.spot)}
                                                    id={`spot-${spot.floor}-${spot.spot}`}
                                                    style={{
                                                        width: '150px',
                                                        height: '200px',
                                                        backgroundColor: getColor(spot.available),
                                                        float: 'left',
                                                        margin: '5px',
                                                        textAlign: 'center',
                                                        lineHeight: '200px',
                                                        borderRadius: '10px',
                                                        cursor: 'pointer'
                                                    }}
                                                >
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

          <ParkingSpotDetailsDialog visible={dialogVisible} onHide={() => setDialogVisible(false)} spotHistory={selectedSpotHistory} currentUsage={selectedSpotCurrentUsage} />


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
