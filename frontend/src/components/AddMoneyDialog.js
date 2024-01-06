import React, { useRef } from 'react';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { Formik, Field, Form } from 'formik';
import axios from 'axios';
import { SERVER_ADDRESS } from '../../utils/Links'
import reload from '../../utils/Reload'

const AddMoneyDialog = ({ visible, onHide }) => {
    const toast = useRef(null);

    const dummyUserData = {
        "_id": "a61f338f-5651-47cf-ae44-5eee67b825cc",
        "license_plates": ["VFK-8994", "RWM-9308", "GVU-1723", "NAP-0519", "YIU-5170", "ZRH-3452", "BTD-4765", "TUT-3628", "OHL-5890", "XYZ-6003"],
        "money": 0.0,
        "username": "nowy_uzytkownik"
      }

    const accept = (values) => {
        axios.put(`${SERVER_ADDRESS}/user/${dummyUserData._id}/add_money`, values)
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
                header="Doładuj konto"
                icon="pi pi-exclamation-triangle" 
            >
                <div>
                    <Formik
                        initialValues={{
                            add_money: '',
                        }}
                        onSubmit={async (values) => {
                            await new Promise((r) => setTimeout(r, 500));
                            accept(values);
                            onHide();
                        }}
                        >
                        <Form>
                            <label htmlFor="add_money">kwota</label>
                            <Field id="add_money" name="add_money" placeholder="20" />
                            <button type="submit">Zatwierdź</button>
                        </Form>
                    </Formik>
                    
                    </div>
            </Dialog>
        </>
    );
};

export default AddMoneyDialog;