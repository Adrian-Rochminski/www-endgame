import React, { useRef } from 'react';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { Formik, Field, Form } from 'formik';
import axios from 'axios';
import { SERVER_ADDRESS } from '../../utils/Links'

const CreateUpdateDialog = ({ visible, onHide, oldLicensePlate }) => {


    console.log(oldLicensePlate);
    const toast = useRef(null);

    const dummyUserData = {
        "_id": "a61f338f-5651-47cf-ae44-5eee67b825cc",
        "license_plates": ["VFK-8994", "RWM-9308", "GVU-1723", "NAP-0519", "YIU-5170", "ZRH-3452", "BTD-4765", "TUT-3628", "OHL-5890", "XYZ-6003"],
        "money": 0.0,
        "username": "nowy_uzytkownik"
      }

    const accept = (values) => {
        (oldLicensePlate ? 
            axios.put(`${SERVER_ADDRESS}/user/${dummyUserData._id}/update_license_plate`, values) : 
            axios.put(`${SERVER_ADDRESS}/user/${dummyUserData._id}/license_plate`, values)
        )
          .then(response => {
            console.log(response.data);
            toast.current.show({ severity: 'success', summary: 'Success', detail: `${JSON.stringify(values)}`, life: 3000 });
          })
          .catch(error => {
            console.error('Error fetching data 1:', error);
            toast.current.show({ severity: 'error', summary: 'Error', detail: `${JSON.stringify(values)} - ${error}`, life: 3000 });
          });
        
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
                                <label htmlFor="licensePlate">License Plate</label>
                                <Field id="license_plate" name="license_plate" placeholder="STH-12345" />
                                <button type="submit">Submit</button>
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
                                <label htmlFor="licensePlate">Old License Plate</label>
                                <Field id="old_license_plate" name="old_license_plate" placeholder={oldLicensePlate} disabled="true" />
                                <label htmlFor="licensePlate">New License Plate</label>
                                <Field id="new_license_plate" name="new_license_plate" placeholder="STH-12345" />
                                <button type="submit">Submit</button>
                            </Form>
                        </Formik>
                    )}
                    </div>
            </Dialog>
        </>
    );
};

export default CreateUpdateDialog;