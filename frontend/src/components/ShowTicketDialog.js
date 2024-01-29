import React, { useState, useEffect, useRef } from 'react';
import { Dialog } from 'primereact/dialog';
import axios from 'axios';
import { SERVER_ADDRESS } from '../../utils/Links'
import QRCode from 'qrcode.react';

const ShowTicketDialog = ({ visible, onHide, licensePlate, token }) => {

    const [plateDetails, setPlateDetails] = useState(null);

      const dummyPlateDetails = {
        "location": "ul. Wółczańska 189, Łódź",
        "end_date": "10:40 19.12.2023",
        "license_plate": licensePlate
      }

      useEffect(() => {
          const config = {
              headers: {
                  Authorization: `Bearer ${token}`
              }
          };

          axios.post(`${SERVER_ADDRESS}/user/license_plate_details`, licensePlate, config)
          .then(response => {
            console.log(response.data);
            setPlateDetails(response.data);
          })
          .catch(error => {
            console.error('Error fetching data 1:', error);
            setPlateDetails(dummyPlateDetails);
          });
      }, [licensePlate]);
    if (!plateDetails) { return <p>Waiting for plate details ...</p>; }


    return (
        <>
            <Dialog 
                visible={visible} 
                onHide={onHide}
                header="Szczegóły biletu"
                icon="pi pi-exclamation-triangle" 
            >
                <div>
                    <p className="m-0">Parking: {plateDetails.location}</p>
                    <p className="m-0">Data wyjazdu: {plateDetails.end_date}</p>
                    <p className="m-0">Numer rejestracyjny: {plateDetails.license_plate}</p>
                    <QRCode value={licensePlate} />
                </div>
            </Dialog>
        </>
    );
};

export default ShowTicketDialog;