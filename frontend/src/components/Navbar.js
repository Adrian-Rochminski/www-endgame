import React from 'react';
import { Menubar } from 'primereact/menubar';
import ParkingOSImage from "../../public/ParkingOS_icon.png";

const Navbar = () => {
  const items = [
    {
       label: 'ParkingOS',
    }
  ];

  const start = <img alt="ParkingOS" src={ParkingOSImage.src} style={navbar_img_style} className="mr-2"></img>;

  return (
    <div style={navbar_div_style}>
      <Menubar model={items} start={start} />
    </div>
  );
};

const navbar_div_style = {
    color: '#fff',
    width: "100vw",
    padding: "0px",
    margin: "0px",
}

const navbar_img_style = {
    width: '50px',
}

export default Navbar;