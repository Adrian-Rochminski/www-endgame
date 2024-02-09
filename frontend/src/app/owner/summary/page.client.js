"use client"
import { useRouter } from "next/navigation";
import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../../../components/Navbar';
import axios from 'axios';
import { Card } from 'primereact/card';
import {MyCollapseButton, MyPrimaryButton, MySecondaryButton} from '../../../components/MyButtons';
import { ScrollPanel } from 'primereact/scrollpanel';
import { SERVER_ADDRESS } from '../../../../utils/Links'
import { Chart } from 'primereact/chart';
import {Accordion, AccordionTab} from "primereact/accordion";
import {Toast} from "primereact/toast";
import { Calendar } from 'primereact/calendar';

export const Summary = (session) => {
    const router = useRouter();
    const [parkingId, setParkingId] = useState('');
    const [parkingAddress, setParkingAddress] = useState('');
    const [dates, setDates] = useState(getDates());
    const [summary, setSummary] = useState([]);
    const [summaryData, setSummaryData] = useState({});

    const toast = useRef(null);

    let authHeader = {
        headers: {
            Authorization: "Bearer " + session.token.token
        }
    }

    function getDates(){
        let currentDate = new Date();
        currentDate.setMonth(currentDate.getMonth() - 3);
        return [currentDate, new Date()]
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

    // /costs/summary

    function fetchSummary() {
        console.log("here summary -> " + parkingId)

        let data = {
            "parking_id": parkingId,
            "start_date": dates[0].toISOString().split('T')[0],
            "end_date": dates[1].toISOString().split('T')[0]
        }

        if (parkingId) {
            axios.post(`${SERVER_ADDRESS}/parking/summary`, data, authHeader)
                .then(response => {
                    console.log(response.data);
                    console.log(response.data.profit_summary);
                    setSummary(response.data.profit_summary);
                    extractData();
                })
                .catch(error => {
                    console.error('Error fetching data:', error);
                });
        }
    }

    function extractData(){
        const months = summary.map(item => item.month);
        const profits = summary.map(item => item.profit);
        const costs = summary.map(item => item.cost);
        const earnings = summary.map(item => item.earnings);

        const data = {
            labels: months,
            datasets: [
                {
                    label: 'Bilans',
                    data: profits,
                    fill: false,
                    borderColor: 'rgb(75,192,192)',
                    tension: 0.4
                },
                {
                    label: 'Koszta',
                    data: costs,
                    fill: false,
                    borderColor: 'rgb(192,75,75)',
                    tension: 0.4
                },
                {
                    label: 'Zyski',
                    data: earnings,
                    fill: false,
                    borderColor: 'rgb(83,192,75)',
                    tension: 0.4
                }
            ]
        };

        setSummaryData(data);
    }


    function liveView(){
        router.push("/owner/live_view?id=" + JSON.stringify(parkingId));
    }

    function costs(){
        router.push("/owner/costs?data=" + JSON.stringify({"id": parkingId, "address": parkingAddress}));
    }

    return (
        <div className="Costs" style={style}>
            <Navbar />
            <div className="card flex justify-content-center mt-10" style={card_style}>
                <Card title={"Podsumowanie parkingu: " + parkingAddress} subTitle="" className="md:w-75rem">

                    <MyPrimaryButton label="Podgląd" style={{ marginLeft: '0.5em' }} onClick={() => liveView()}/>
                    <MySecondaryButton label="Koszty" style={{ marginLeft: '0.5em' }} onClick={() => costs()}/>
                    <br></br><br></br>


                        <div className="card" style={{ width: '600px'}}>

                            <label style={textStyle}>Przedział czasowy:</label>
                            <Calendar value={dates} onChange={(e) => setDates(e.value)} selectionMode="range" readOnlyInput style={fieldStyle} view="month" dateFormat="yy-mm-dd" />
                            <MyPrimaryButton label="Pokaż" onClick={() => fetchSummary()} style={{marginLeft:30}}/>

                            <div style={{marginTop: 30}}>
                                { summary ?
                                        <Chart type="line" data={summaryData}  />
                                        : <>Brak danych do wyświetlenia</>
                                }
                            </div>
                        </div>

                </Card>
            </div>

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

const textStyle = {
    marginRight: 30,
};

const fieldStyle = {
    border: "1px solid #06b6d4",
    padding: "0px 10px",
    borderRadius: "5px",
    flexGrow: 0,
    textAlign: "right",
    outline: 'none',
};