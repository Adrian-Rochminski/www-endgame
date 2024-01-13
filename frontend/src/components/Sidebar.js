
import React, { useState } from 'react';
import { Sidebar } from 'primereact/sidebar';
import { Button } from 'primereact/button';
import axios from 'axios';
import { SERVER_ADDRESS, CLIENT_ADDRESS } from '../../utils/Links'

export default function MenuSidebar({ visible, onHide }) {

    function logout(){
        axios.get(`${SERVER_ADDRESS}/user/logout`)
          .then(response => {
            console.log(response.data);
          })
          .catch(error => {
            console.error('Error fetching data logout:', error);
          });
          window.location.href = `${CLIENT_ADDRESS}/`;
    }

    function toPasswdChange(){
          window.location.href = `${CLIENT_ADDRESS}/driver/change_password`;
    }

    return (
        <div className="card flex justify-content-center">
            <Sidebar visible={visible} onHide={onHide} className="w-20rem md:w-20rem lg:w-30rem">
                <h2>Options</h2>
                <ol>
                    <li><Button label="Zmień hasło" severity="Warning" onClick={() => toPasswdChange()}/></li>
                    <li><Button label="Wyloguj" severity="Danger" onClick={() => logout()}/></li>
                </ol>
            </Sidebar>
        </div>
    )
}
        