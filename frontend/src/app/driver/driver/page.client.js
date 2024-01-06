'use client'

import React, { useState, useEffect } from 'react';
import Navbar from '../../../components/Navbar';
import axios from 'axios';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { ScrollPanel } from 'primereact/scrollpanel';

export default function Driver() {
    const [data, setData] = useState(null);
    const dummyContent = {
      "_id": "a61f338f-5651-47cf-ae44-5eee67b825cc",
      "is_owner": false,
      "license_plates": ["VFK-8994", "RWM-9308", "GVU-1723", "NAP-0519", "YIU-5170", "ZRH-3452", "BTD-4765", "TUT-3628", "OHL-5890", "XYZ-6003"],
      "money": 0.0,
      "password": "sha256$aIVuJxPZbT3QEw2D$9a5948d94c65b3b893dc65909deceb09f1ddae198a55ed046b35b2f18ab09839",
      "username": "nowy_uzytkownik"
  }

    useEffect(() => {
        axios.get('http://127.0.0.1:5000/users')
          .then(response => {
            console.log(response.data);
            setData(response.data)
          })
          .catch(error => {
            console.error('Error fetching data:', error);
            setData(dummyContent)
          });
      }, []);
    if (!data) { return <p>Waiting ...</p>; }

    const footer = (
        <>
            <Button label="Dodaj nowy pojazd" />
        </>
    );

    return (
        <div className="Driver" style={style}>
          <Navbar />
          <div className="card flex justify-content-center mt-10" style={card_style}>
            <Card title="Karta Kierowcy" subTitle="" footer={footer} className="md:w-25rem">
                <p className="m-0">Witaj: {data.username}</p>

                <p className="m-0">Twoje saldo: {data.money}</p>
                <Button label="Doładuj konto" />

                <p className="m-0">Twoje samochody:</p>
                <ScrollPanel style={{ width: '200px', height: '300px' }}>
                  <div className="card">
                      <Accordion activeIndex={0}>
                        {data.license_plates.map((plate, index) => (
                            <AccordionTab header={`${plate}`} key={index}>
                                <p className="m-0">
                                  <Button label="Edytuj" />
                                  <Button label="Zaparkuj" style={{ marginLeft: '0.5em' }} />
                                </p>
                            </AccordionTab>
                        ))}
                      </Accordion>
                  </div>
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

const driver_style = {
  backgroundColor: "#fff",
  color: "#000",
  margin: "auto",
  margin: "50px",
}