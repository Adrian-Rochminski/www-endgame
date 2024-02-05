import React from 'react';
import { Field, Form } from 'formik';

export const MyFormField = props => {
    return (
        <Field 
            id={props.id} 
            name={props.name}
            type={props.type}
            step={props.step}
            min={props.min}
            max={props.max}
            placeholder={props.placeholder} 
            disabled={props.disabled}
            onChnge={props.onChange}
            value={props.value}
            style={{...props.style, ...fieldStyle}} 
        />
    );
};

export const MyFormView = ({ children, ...props }) => {
    return (
        <div style={{...props.style, ...viewStyle}}>
            {children}
        </div>
    );
};

export const MyFormText = ({ children, ...props }) => {
    return (
        <label htmlFor={props.htmlFor} style={{...props.style, ...textStyle}}>
            {children}
        </label>
    );
};

export const MyFormHeaderText = ({ children, ...props }) => {
    return (
        <label style={{...props.style, ...textHeaderStyle}}>
            {children}
        </label>
    );
};

export const MyForm = ({ children, ...props }) => {
    return (
        <Form>{children}</Form>
    );
};

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

