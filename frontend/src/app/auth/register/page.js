"use client"
import axios from "axios";
import {Toast} from "primereact/toast";
import Navbar from "@/components/Navbar";
import React, {useRef} from "react";
import {useFormik} from "formik";
import { useRouter } from "next/navigation";
import {Card} from "primereact/card";
import {SERVER_ADDRESS} from "../../../../utils/Links";

export default function Register() {
    const toast = useRef(null);
    const router = useRouter();

    const formik = useFormik({
        initialValues: {
            username: '',
            password: '',
        },
        onSubmit: async (values) => {
            try {
                const response = await axios.post(SERVER_ADDRESS + '/register', values);
                console.log(response);
                toast.current.show({ severity: 'success', summary: 'Success', detail: "Account created successfully", life: 3000 });
                router.push('/auth/signin');
            } catch (error) {
                console.log(error);
                const errorMessage = error.response?.data || 'An error occurred';
                toast.current.show({ severity: 'error', summary: 'Error', detail: errorMessage, life: 3000 });
            }
        },
    });

    return (
        <div style={style}>
            <Navbar showMenuBtn={false}/>
            <div className="card flex justify-content-center mt-10" style={card_style}>
                <Card title="Rejestracja" subTitle="" className="md:w-25rem">
                    <Toast ref={toast} />
                    <form onSubmit={formik.handleSubmit}>
                        <div>
                            <label htmlFor="username">Username:</label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                onChange={formik.handleChange}
                                value={formik.values.username}
                            />
                        </div>
                        <div>
                            <label htmlFor="password">Password:</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                onChange={formik.handleChange}
                                value={formik.values.password}
                            />
                        </div>
                        <button type="submit">Stwórz konto</button>
                    </form>
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

const driver_style = {
    backgroundColor: "#fff",
    color: "#000",
    margin: "auto",
}

const navbar_img_style = {
    width: '25px',
}

