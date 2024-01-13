'use client'

import React, { useRef } from 'react';
import Navbar from '../../components/Navbar';
import axios from 'axios';
import { Card } from 'primereact/card';
import { SERVER_ADDRESS, CLIENT_ADDRESS } from '../../../utils/Links'
import { Toast } from 'primereact/toast';
import { Formik, Field, Form } from 'formik';

export default function Driver() {
    const toast = useRef(null);

    function validate(values){
        if(values.new_password_0 !== values.new_password_1){
            toast.current.show({ severity: 'error', summary: 'Błąd', detail: "Rozbieżność w hasłach", life: 3000 });
        }
        else if(!values.old_password || !values.new_password_0 || !values.new_password_1){
          toast.current.show({ severity: 'error', summary: 'Błąd', detail: "Wszystkie pola są wymagane", life: 3000 });
        }
        else if(values.new_password_0.length < 8){
          toast.current.show({ severity: 'error', summary: 'Błąd', detail: "nowe haslo powinno miec conajmniej 8 znaków", life: 3000 });
        }
        else{
            axios.post(`${SERVER_ADDRESS}/user/change_password`, values)
          .then(response => {
            console.log(response.data);
            window.location.href = `${CLIENT_ADDRESS}/`;
          })
          .catch(error => {
            console.error('Error fetching data 1:', error);
            toast.current.show({ severity: 'error', summary: 'Błąd', detail: `${JSON.stringify(values)} - ${error}`, life: 3000 });
            //window.location.href = `${CLIENT_ADDRESS}/`;
          });
        }
    }
    
    return (
        <div className="Account" style={style}>
            <Toast ref={toast} />
          <Navbar />
          <div className="card flex justify-content-center mt-10" style={card_style}>
            <Card title="Zmiana hasła" subTitle="" className="md:w-25rem">
            <Formik
                initialValues={{
                    old_password: '',
                    new_password_0: '',
                    new_password_1: '',
                }}
                onSubmit={async (values) => {
                    await new Promise((r) => setTimeout(r, 500));
                    validate(values);
                }}
                >
                <Form>
                    <ul>
                        <li>
                            <label htmlFor="old_password">stare hasło</label>
                            <Field id="old_password" name="old_password" placeholder="starte hasło" type="password"/>
                        </li>
                        <li>
                            <label htmlFor="new_password_0">nowe hasło</label>
                            <Field id="new_password_0" name="new_password_0" placeholder="nowe hasło" type="password"/>
                        </li>
                        <li>
                            <label htmlFor="new_password_1">powtórz nowe hasło</label>
                            <Field id="new_password_1" name="new_password_1" placeholder="powtórz nowe hasło" type="password"/>
                        </li>
                    </ul>
                    
                    <button type="submit">Zatwierdź</button>
                </Form>
            </Formik>
                
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
