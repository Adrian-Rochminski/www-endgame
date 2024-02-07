"use client"
import React, { useRef } from 'react';
import { useFormik } from 'formik';
import { Toast } from 'primereact/toast';
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import {Card} from "primereact/card";
import {signIn} from "next-auth/react";
import {MyFormButton} from "../../../components/MyButtons";

export const SignIn = (session) => {
    const toast = useRef(null);
    const router = useRouter();

    if (session.user){
        if (session.role === "driver")
            return { redirect: { destination: "/driver" } }
        else
            return { redirect: { destination: "/owner" } }
    }

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
                        <div style={viewStyle}>
                            <label htmlFor="username" style={textStyle}>Nazwa:</label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                onChange={formik.handleChange}
                                value={formik.values.username}
                                style={fieldStyle}
                            />
                        </div>
                        <div style={viewStyle}>
                            <label htmlFor="password" style={textStyle}>Hasło:</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                onChange={formik.handleChange}
                                value={formik.values.password}
                                style={fieldStyle}
                            />
                        </div>
                        <MyFormButton name={"Zaloguj się"}/>
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

const fieldStyle = {
    border: "1px solid #06b6d4",
    padding: "0px 10px",
    borderRadius: "5px",
    flexGrow: 0,
    textAlign: "right",
    outline: 'none',
};

const viewStyle = {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
};

const textStyle = {
    marginRight: 30,
};

const textHeaderStyle = {
    marginRight: 30,
    fontWeight: 'bold',
    fontSize: '17px',
    marginBottom: '10px',
};
