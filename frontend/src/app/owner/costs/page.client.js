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

export const Costs = (session) => {
    const router = useRouter();

    let authHeader = {
        headers: {
            Authorization: "Bearer " + session.token.token
        }
    }

    return (
        <div className="Costs" style={style}>
          <Navbar />
          <div className="card flex justify-content-center mt-10" style={card_style}>
              <Card title={"Koszty parkingu: "} subTitle="" className="md:w-75rem">

                <ScrollPanel style={{ width: '600px', height: '600px' }}>
                    
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
