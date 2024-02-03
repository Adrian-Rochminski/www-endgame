import React, { useRef } from 'react';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { Formik, Field, Form } from 'formik';
import axios from 'axios';
import { SERVER_ADDRESS } from '../../utils/Links'
import reload from '../../utils/Reload'
import { MyFormButton } from './MyButtons';

const AddMoneyDialog = ({ visible, onHide, token }) => {
    const toast = useRef(null);

    const accept = (values) => {
        const config = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        };

        axios.put(`${SERVER_ADDRESS}/user/add_money`, values, config)
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
                            <MyFormButton name={"Zatwierdź"}/>
                        </Form>
                    </Formik>
                    
                    </div>
            </Dialog>
        </>
    );
};

export default AddMoneyDialog;