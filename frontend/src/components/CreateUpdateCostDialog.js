import React, { useRef } from 'react';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { Formik, Field, Form } from 'formik';
import axios from 'axios';
import { SERVER_ADDRESS } from '../../utils/Links'
import reload from '../../utils/Reload'
import { MyFormButton } from './MyButtons';
import { MyFormField, MyFormText, MyFormView, MyFormHeaderText } from './MyForms';

export const CreateUpdateCostDialog = ({ visible, onHide, oldCost, parkingId, token }) => {
    console.log(oldCost);
    const toast = useRef(null);

    const accept = (values) => {
        console.log("Before send: " + JSON.stringify(values));

        const config = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        };

        var parkingIdDict = oldCost ? {"parking_id": parkingId, "cost_id": oldCost._id} : {"parking_id": parkingId}  // add required parking id (and cost is only in edit) 
        if (Array.isArray(values.periodic) && values.periodic.length === 1 && values.periodic[0] === "on") {  // map periodic
            values.periodic = true;
        } else if (values.periodic === "" || (Array.isArray(values.periodic) && values.periodic.length === 0)) {
            values.periodic = false;
        }
        if(oldCost) values.end_date = values.periodic ? null : values.end_date;  // change end_date depends on periodic state (only if edit)

        console.log("Ready send: " + JSON.stringify(values));

        const request = { ...parkingIdDict, ...values };  // connect 2 dicts into one with proper order

        console.log("Request: " + JSON.stringify(request));

        (oldCost ? 
            axios.put(`${SERVER_ADDRESS}/parking/costs/update`, request, config):
            axios.post(`${SERVER_ADDRESS}/parking/costs`, request, config)
        )
          .then(response => {
            console.log(response.data);
            toast.current.show({ severity: 'success', summary: 'Sukces', detail: `${JSON.stringify(request)}`, life: 3000 });
          })
          .catch(error => {
            console.error('Error fetching data:', error);
            toast.current.show({ severity: 'error', summary: 'Błąd', detail: `${JSON.stringify(request)} - ${error}`, life: 3000 });
          });
          //reload(3000);
    };

    const handleChange = (event) => {
        setIsChecked(event.target.checked);
      };
    
    return (
        <>
            <Toast ref={toast} />
            <Dialog 
                visible={visible} 
                onHide={onHide}
                header={!oldCost ? "Dodawanie kosztów" : "Edycja kosztów"} 
                icon="pi pi-exclamation-triangle" 
            >
                <div>
                    {!oldCost ? (
                        <Formik
                            initialValues={{
                                name: '',
                                price: '',
                                start_date: '',
                                periodic: '',
                            }}
                            onSubmit={async (values) => {
                                await new Promise((r) => setTimeout(r, 500));
                                accept(values);
                                onHide();
                            }}
                            >
                            <Form>
                                <MyFormView>
                                    <MyFormText htmlFor="name">Nazwa kosztu:</MyFormText>
                                    <MyFormField id="name" name="name" placeholder="Utylizacja gołębi" type="text"/>
                                </MyFormView>

                                <MyFormView>
                                    <MyFormText htmlFor="price">Koszty:</MyFormText>
                                    <MyFormField id="price" name="price" placeholder="200" type="number"/>
                                </MyFormView>

                                <MyFormView>
                                    <MyFormText htmlFor="start_date">Początek usługi:</MyFormText>
                                    <MyFormField id="start_date" name="start_date" placeholder="2024-02-06" type="text"/>
                                </MyFormView>

                                <MyFormView>
                                    <MyFormText htmlFor="periodic">Koszt cykliczny:</MyFormText>
                                    <MyFormField id="periodic" name="periodic" type="checkbox" onChange={handleChange} style={{ width: '20px', height: '20px', transform: 'scale(1.2)' }}/>
                                </MyFormView>
                                
                                <MyFormButton name={"Zatwierdź"}/>
                            </Form>
                        </Formik>
                    ):(
                        <Formik
                            initialValues={{
                                name: oldCost.name,
                                price: oldCost.price,
                                start_date: oldCost.start_date,
                                end_date: oldCost.end_date,
                                periodic: oldCost.periodic,
                            }}
                            onSubmit={async (values) => {
                                await new Promise((r) => setTimeout(r, 500));
                                accept(values);
                                onHide();
                            }}
                            >
                            <Form>
                                <MyFormView>
                                    <MyFormText htmlFor="name">Nazwa kosztu:</MyFormText>
                                    <MyFormField id="name" name="name" placeholder={oldCost.name} type="text"/>
                                </MyFormView>

                                <MyFormView>
                                    <MyFormText htmlFor="price">Koszty:</MyFormText>
                                    <MyFormField id="price" name="price" placeholder={oldCost.price} type="number"/>
                                </MyFormView>

                                <MyFormView>
                                    <MyFormText htmlFor="start_date">Początek usługi:</MyFormText>
                                    <MyFormField id="start_date" name="start_date" placeholder={oldCost.start_date} type="text"/>
                                </MyFormView>

                                <MyFormView>
                                    <MyFormText htmlFor="end_date">Początek usługi:</MyFormText>
                                    <MyFormField id="end_date" name="end_date" placeholder={oldCost.end_date} type="text"/>
                                </MyFormView>

                                <MyFormView>
                                    <MyFormText htmlFor="periodic">Koszt cykliczny:</MyFormText>
                                    <MyFormField id="periodic" name="periodic" type="checkbox" onChange={handleChange} style={{ width: '20px', height: '20px', transform: 'scale(1.2)' }}/>
                                </MyFormView>
                                
                                <MyFormButton name={"Zatwierdź"}/>
                            </Form>
                        </Formik>
                    )}
                    </div>
            </Dialog>
        </>
    );
};
