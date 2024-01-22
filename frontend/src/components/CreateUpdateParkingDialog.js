import React, { useRef } from 'react';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { Formik, Field, Form } from 'formik';
import axios from 'axios';
import { SERVER_ADDRESS } from '../../utils/Links'
import reload from '../../utils/Reload'

const CreateUpdatParkingDialog = ({ visible, onHide, oldParking }) => {

    const toast = useRef(null);

    const accept = (values) => {
        (oldParking ? 
            axios.put(`${SERVER_ADDRESS}/parking/update`, values) : 
            axios.post(`${SERVER_ADDRESS}/parking/make`, values)
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
                                <ul>
                                    <li>
                                        <h5><b>Opcje podstawowe</b></h5>
                                    </li>

                                    <li>
                                        <label htmlFor="address">Adres:</label>
                                        <Field id="address" name="address"/>
                                    </li>
                                    
                                    <li>
                                        <label htmlFor="floors">Piętra:</label>
                                        <Field id="floors" name="floors"/>
                                    </li>

                                    <li>
                                        <label htmlFor="spots_per_floor">Miejsca na piętrach:</label>
                                        <Field id="spots_per_floor" name="spots_per_floor"/>
                                    </li>

                                    <li>
                                        <label htmlFor="day_rate">Taryfa dzienna:</label>
                                        <Field id="day_rate" name="day_rate"/>
                                    </li>

                                    <li>
                                        <label htmlFor="night_rate">Taryfa nocna:</label>
                                        <Field id="night_rate" name="night_rate"/>
                                    </li>

                                    <li>
                                        <label htmlFor="day_time_start">Początek dnia:</label>
                                        <Field id="day_time_start" name="day_time_start"/>
                                    </li>

                                    <li>
                                        <label htmlFor="day_time_end">Koniec dnia:</label>
                                        <Field id="day_time_end" name="day_time_end"/>
                                    </li>

                                    <li>
                                        <h5><b>Opcje dodatkowe</b></h5>
                                    </li>

                                    <li>
                                        <label htmlFor="first_hour">Pierwsza godzina:</label>
                                        <Field id="first_hour" name="first_hour"/>
                                    </li>

                                    <li>
                                        <label htmlFor="rate_from_six_hours">Następne 6 godzin:</label>
                                        <Field id="rate_from_six_hours" name="rate_from_six_hours"/>
                                    </li>

                                    <li>
                                        <button type="submit">Zatwierdź</button>
                                    </li>

                                </ul>
                            </Form>
                        </Formik>
                    
                    </div>
            </Dialog>
        </>
    );
};

export default CreateUpdatParkingDialog;
