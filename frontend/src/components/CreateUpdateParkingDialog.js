import React, { useRef } from 'react';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { Formik, Field, Form } from 'formik';
import axios from 'axios';
import { SERVER_ADDRESS } from '../../utils/Links'
import reload from '../../utils/Reload'
import { MyFormButton } from './MyButtons';
import { MyFormField, MyFormText, MyFormView, MyFormHeaderText } from './MyForms';

const CreateUpdatParkingDialog = ({ visible, onHide, oldParking, token }) => {

    const toast = useRef(null);

    const config = {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };

    const accept = (values) => {
        (oldParking ? 
            axios.put(`${SERVER_ADDRESS}/parking/update`, values, config) :
            axios.post(`${SERVER_ADDRESS}/parking/make`, values, config)
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
                header={!oldParking ? "Dodawanie parkingu" : "Edycja parkingu"} 
                icon="pi pi-exclamation-triangle" 
            >
                <div>
                        <Formik
                            initialValues={
                                !oldParking ? {
                                    address: '',
                                    floors: '',
                                    spots_per_floor: '',
                                    day_rate: '',
                                    night_rate: '',
                                    day_time_start: '',
                                    day_time_end: '',
                                    first_hour: '',
                                    rate_from_six_hours: '',
                                } : {
                                    address: oldParking.address,
                                    floors: oldParking.floors,
                                    spots_per_floor: oldParking.spots_per_floor,
                                    day_rate: oldParking.day_rate,
                                    night_rate: oldParking.night_rate,
                                    day_time_start: oldParking.day_time_start,
                                    day_time_end: oldParking.day_time_end,
                                    first_hour: oldParking.extra_rules ? oldParking.extra_rules.first_hour : '',
                                    rate_from_six_hours: oldParking.extra_rules ? oldParking.extra_rules.rate_from_six_hours : '',
                                }
                            }
                            onSubmit={async (values) => {
                                await new Promise((r) => setTimeout(r, 500));
                                accept(values);
                                onHide();
                            }}
                            >
                            <Form>
                                <MyFormHeaderText>Opcje podstawowe</MyFormHeaderText>
                                
                                <MyFormView>
                                    <MyFormText htmlFor="address">Adres:</MyFormText>
                                    <MyFormField id="address" name="address" placeholder="Łódź, Radwańska 37" type="text"/>
                                </MyFormView>

                                <MyFormView>
                                    <MyFormText htmlFor="floors">Piętra:</MyFormText>
                                    <MyFormField id="floors" name="floors" placeholder="3" step="1" min="1" type="number"/>
                                </MyFormView>

                                <MyFormView>
                                    <MyFormText htmlFor="spots_per_floor">Miejsca na piętrach:</MyFormText>
                                    <MyFormField id="spots_per_floor" name="spots_per_floor" placeholder="10" step="1" min="1" type="number"/>
                                </MyFormView>

                                <MyFormView>
                                    <MyFormText htmlFor="day_rate">Taryfa 1:</MyFormText>
                                    <MyFormField id="day_rate" name="day_rate" placeholder="2.1" step="0.1" min="0.1" type="number"/>
                                </MyFormView>

                                <MyFormView>
                                    <MyFormText htmlFor="night_rate">Taryfa 2:</MyFormText>
                                    <MyFormField id="night_rate" name="night_rate" placeholder="4.2" step="0.1" min="0.1" type="number"/>
                                </MyFormView>

                                <MyFormView>
                                    <MyFormText htmlFor="day_time_start">Początek dnia:</MyFormText>
                                    <MyFormField id="day_time_start" name="day_time_start" placeholder="08:30" type="text"/>
                                </MyFormView>

                                <MyFormView>
                                    <MyFormText htmlFor="day_time_end">Koniec dnia:</MyFormText>
                                    <MyFormField id="day_time_end" name="day_time_end" placeholder="21:45" type="text"/>
                                </MyFormView>

                                <MyFormHeaderText>Opcje dodatkowe</MyFormHeaderText>

                                <MyFormView>
                                    <MyFormText htmlFor="first_hour">Pierwsza godzina:</MyFormText>
                                    <MyFormField id="first_hour" name="first_hour" placeholder="3.1" step="0.1" min="0.1" type="number"/>
                                </MyFormView>

                                <MyFormView>
                                    <MyFormText htmlFor="rate_from_six_hours">Następne 6 godzin:</MyFormText>
                                    <MyFormField id="rate_from_six_hours" name="rate_from_six_hours" placeholder="0.2" step="0.1" min="0.1" type="number"/>
                                </MyFormView>

                                <MyFormButton name={"Zatwierdź"}/>
                            </Form>
                        </Formik>
                    
                    </div>
            </Dialog>
        </>
    );
};

export default CreateUpdatParkingDialog;
