import React, { useRef } from 'react';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { Formik, Field, Form } from 'formik';
import axios from 'axios';
import { SERVER_ADDRESS } from '../../utils/Links'
import reload from '../../utils/Reload'
import { MyFormButton } from './MyButtons';

const CreateUpdateDialog = ({ visible, onHide, oldLicensePlate, token }) => {


    console.log(oldLicensePlate);
    const toast = useRef(null);

    const accept = (values) => {
        const config = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        };

        (oldLicensePlate ? 
            axios.post(`${SERVER_ADDRESS}/user/update_license_plate`, values, config) :
            axios.put(`${SERVER_ADDRESS}/user/license_plate`, values, config)
        )
          .then(response => {
            console.log(response.data);
            toast.current.show({ severity: 'success', summary: 'Sukces', detail: `${JSON.stringify(values)}`, life: 3000 });
          })
          .catch(error => {
            console.error('Error fetching data 1:', error);
            toast.current.show({ severity: 'error', summary: 'Błąd', detail: `${JSON.stringify(values)} - ${error}`, life: 3000 });
          });
          reload(3000);
    };

    return (
        <>
            <Toast ref={toast} />
            <Dialog 
                visible={visible} 
                onHide={onHide}
                header={!oldLicensePlate ? "Dodawanie pojazdu" : "Edycja pojazdu"} 
                icon="pi pi-exclamation-triangle" 
            >
                <div>
                    {!oldLicensePlate ? (
                        <Formik
                            initialValues={{
                                license_plate: '',
                            }}
                            onSubmit={async (values) => {
                                await new Promise((r) => setTimeout(r, 500));
                                accept(values);
                                onHide();
                            }}
                            >
                            <Form>
                                <label htmlFor="license_plate">Numer rejestracyjny</label>
                                <Field id="license_plate" name="license_plate" placeholder="STH-12345" />
                                <MyFormButton name={"Zatwierdź"}/>
                            </Form>
                        </Formik>
                    ):(
                        <Formik
                            initialValues={{
                                old_license_plate: oldLicensePlate,
                                new_license_plate: '',
                            }}
                            onSubmit={async (values) => {
                                await new Promise((r) => setTimeout(r, 500));
                                accept(values);
                                onHide();
                            }}
                            >
                            <Form>
                                <label htmlFor="old_license_plate">Stary numer rejestracyjny</label>
                                <Field id="old_license_plate" name="old_license_plate" placeholder={oldLicensePlate} disabled="true" />
                                <label htmlFor="new_license_plate">Nowy numer rejestracyjny</label>
                                <Field id="new_license_plate" name="new_license_plate" placeholder="STH-12345" />
                                <MyFormButton name={"Zatwierdź"}/>
                            </Form>
                        </Formik>
                    )}
                    </div>
            </Dialog>
        </>
    );
};

export default CreateUpdateDialog;