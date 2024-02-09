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

export const Summary = (session) => {
    const router = useRouter();
    const [parkingId, setParkingId] = useState('')
    const [parkingAddress, setParkingAddress] = useState('')
    const [summary, setSummary] = useState([])

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

    // /costs/summary

    // load existing costs
    useEffect(() => {
        console.log("here summary -> " + parkingId)
        if (parkingId) {
            axios.get(`${SERVER_ADDRESS}/parking/summary/${parkingId}`, authHeader)
                .then(response => {
                    console.log(response.data);
                    console.log(response.data.costs);
                    setSummary(response.data.costs);
                })
                .catch(error => {
                    console.error('Error fetching data:', error);
                });
        }
    }, [parkingId]);


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

                    <ScrollPanel style={{ width: '600px', height: '600px' }}>

                        <div className="card">
                            <Accordion activeIndex={0}>

                                {/*{costs.map((cost, index) => (*/}
                                {/*    <AccordionTab*/}
                                {/*        header={*/}
                                {/*            <span className="flex align-items-center gap-2 w-full">*/}
                                {/*                <span className="font-bold white-space-nowrap">{cost.name}</span>*/}
                                {/*                {cost.periodic ? (<Image src="/periodic.svg" alt="periodic" width={20} height={20} priority />) : ("")}*/}
                                {/*            </span>*/}
                                {/*        }*/}
                                {/*        key={index}*/}
                                {/*    >*/}
                                {/*        <p className="m-0">*/}
                                {/*            <div key={index} style={{ paddingBottom: '10px' }}>*/}
                                {/*                <strong>Cena:</strong> {cost.price}<br />*/}
                                {/*                <strong>Początek usługi:</strong> {cost.start_date}<br />*/}
                                {/*                <strong>Koniec usługi:</strong> {cost.end_date ? cost.end_date : "Usługa jest cykliczna"}<br />*/}
                                {/*            </div>*/}
                                {/*            <MyCollapseButton label="Edytuj" onClick={() => edit(cost)}/>*/}
                                {/*            <MyCollapseButton label="Usuń" onClick={() => remove(cost)}/>*/}
                                {/*        </p>*/}
                                {/*    </AccordionTab>*/}
                                {/*))}*/}

                            </Accordion>
                        </div>

                    </ScrollPanel>
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