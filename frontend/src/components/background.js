import backgroundImage from "../../public/background.jpg";

export const Background = (props) => {
    return (
        <div
            style={{
                backgroundImage: `url(${backgroundImage.src})`,
                backgroundPosition: "center",
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
                width: "100vw",
                height: "100vh",
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            { props.children }
        </div>
    );
}