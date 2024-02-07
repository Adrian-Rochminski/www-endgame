
import React, { useState } from 'react';
import { Sidebar } from 'primereact/sidebar';
import { Button } from 'primereact/button';
import axios from 'axios';
import { SERVER_ADDRESS, CLIENT_ADDRESS } from '../../utils/Links'
import { MyPrimaryButton, MySecondaryButton } from './MyButtons';
import {signOut} from "next-auth/react";

export default function MenuSidebar({ visible, onHide }) {

    async function logout() {
        axios.get(`${SERVER_ADDRESS}/user/logout`)
            .then(response => {
                console.log(response.data);
            })
            .catch(error => {
                console.error('Error fetching data logout:', error);
            });
        await signOut();
        window.location.href = `${CLIENT_ADDRESS}/`;
    }

    function toPasswdChange(){
          window.location.href = `${CLIENT_ADDRESS}/change_password`;
    }

    return (
        <div className="card flex justify-content-center">
            <Sidebar visible={visible} onHide={onHide} className="w-20rem md:w-20rem lg:w-30rem">
                <p><b>Options</b></p>
                <ol>
                    <br></br>
                    <li><MyPrimaryButton label="Wyloguj" onClick={() => logout()}/></li>
                    <br></br>
                </ol>
            </Sidebar>
        </div>
    )
}
        