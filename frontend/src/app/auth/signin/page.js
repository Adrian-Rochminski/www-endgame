"use client"
import React, { useRef } from 'react';
import { useFormik } from 'formik';
import axios from 'axios';
import { Toast } from 'primereact/toast';
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import {Card} from "primereact/card";
import {signIn} from "next-auth/react";

export default function SignIn() {
    const toast = useRef(null);
    const router = useRouter();

    // if (session) {
    //     return { redirect: { destination: "/driver" } }
    // }

    const formik = useFormik({
        initialValues: {
            username: '',
            password: '',
        },
        onSubmit: async (values) => {
            try {
                const response = await signIn("credentials", {
                    username: values.username,
                    password: values.password,
                    redirect: false,
                });
                console.log('Login respose: ', {response});
                toast.current.show({ severity: 'success', summary: 'Success', detail: 'Sign in successful', life: 3000 });
                router.push('/driver');
            } catch (error) {
                const errorMessage = error.response?.data?.message || 'An error occurred';
                toast.current.show({ severity: 'error', summary: 'Error', detail: errorMessage, life: 3000 });
            }
        },
    });

    return (
        <div style={style}>
            <Navbar showMenuBtn={false}/>
            <div className="card flex justify-content-center mt-10" style={card_style}>
                <Card title="Logowanie" subTitle="" className="md:w-25rem">
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
                <button type="submit">Zaloguj się</button>
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

