import { Button } from 'primereact/button';

export const MyPrimaryButton = props => {
    return (
        <Button label={props.label} onClick={props.onClick} style={{...props.style, ...primaryStyle}}/>
    );
}

export const MySecondaryButton = props => {
    return (
        <Button label={props.label} onClick={props.onClick} style={{...props.style,...secondaryStyle}}/>
    );
}

export const MyCollapseButton = props => {
    return (
        <Button label={props.label} onClick={props.onClick} style={{...props.style,...collapseStyle}}/>
    );
}

export const MyFormButton = ({name, ...props}) => {
    return (
        <button type="submit" style={{...props.style,...formStyle}}>{name}</button>
    );
}

const primaryStyle = {
    backgroundColor: "#06b6d4",
    padding: "10px",
    color: "white",
}

const secondaryStyle = {
    backgroundColor: "#B8B8F3",
    padding: "10px",
    color: "white",
}

const collapseStyle = {
    backgroundColor: "#E7E7E7",
    padding: "10px",
    color: "black",
    marginLeft: '0.5em',
}

const formStyle = {
    backgroundColor: "#06b6d4",
    padding: "5px",
    color: "white",
    borderRadius: "5px",
}