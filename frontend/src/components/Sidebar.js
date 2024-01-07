
import React, { useState } from 'react';
import { Sidebar } from 'primereact/sidebar';
import { Button } from 'primereact/button';
import axios from 'axios';
import { SERVER_ADDRESS } from '../../utils/Links'
import { CLIENT_ADDRESS } from '../../utils/Links'

export default function MenuSidebar({ visible, onHide }) {

    const dummyUserData = {
        "_id": "a61f338f-5651-47cf-ae44-5eee67b825cc",
        "license_plates": ["VFK-8994", "RWM-9308", "GVU-1723", "NAP-0519", "YIU-5170", "ZRH-3452", "BTD-4765", "TUT-3628", "OHL-5890", "XYZ-6003"],
        "money": 0.0,
        "username": "nowy_uzytkownik"
      }
  

    function logout(){
        axios.get(`${SERVER_ADDRESS}/user/${dummyUserData._id}/logout`)
          .then(response => {
            console.log(response.data);
          })
          .catch(error => {
            console.error('Error fetching data logout:', error);
          });
          console.log(`${CLIENT_ADDRESS}/`);
          window.location.href = "http://127.0.0.1:3000/";
    }

    return (
        <div className="card flex justify-content-center">
            <Sidebar visible={visible} onHide={onHide} className="w-20rem md:w-20rem lg:w-30rem">
                <h2>Options</h2>
                <ol>
                    <li><Button label="Zmień hasło" severity="Warning" /></li>
                    <li><Button label="Wyloguj" severity="Danger" onClick={() => logout()}/></li>
                </ol>
            </Sidebar>
        </div>
    )
}
        