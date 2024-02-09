import React, { useState, useEffect, useRef } from 'react';
import { Dialog } from 'primereact/dialog';
import axios from 'axios';
import { SERVER_ADDRESS } from '../../utils/Links'
import QRCode from 'qrcode.react';

const ShowTicketDialog = ({ visible, onHide, licensePlate, token }) => {

    const [plateDetails, setPlateDetails] = useState(null);

      useEffect(() => {
          const config = {
              headers: {
                  Authorization: `Bearer ${token}`
              }
          };
          
          axios.get(`${SERVER_ADDRESS}/parking/check_plate/${licensePlate}`, config)
          .then(response => {
            console.log(response.data);
            setPlateDetails(response.data);
          })
          .catch(error => {
            console.error('Error fetching data 1:', error);
            setPlateDetails({
                "license_plate": "Error ???",
                "address": "Error ???",
                "floor": Infinity,
                "spot": Infinity,
              });
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
                    <p className="m-0">Numer rejestracyjny: <b>{licensePlate}</b></p>
                    <p className="m-0">Parking: <b>{plateDetails.parking_address}</b></p>
                    <p className="m-0">Piętro: <b>{plateDetails.floor}</b></p>
                    <p className="m-0">Miejsce: <b>{plateDetails.spot}</b></p>
                    <br></br>
                    <QRCode value={JSON.stringify(plateDetails)} size={250}/>
                </div>
            </Dialog>
        </>
    );
};

export default ShowTicketDialog;