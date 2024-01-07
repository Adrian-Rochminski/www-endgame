import React, { useState } from 'react';
import { Menubar } from 'primereact/menubar';
import ParkingOSImage from "../../public/ParkingOS_icon.png";
import MenuSidebar from './Sidebar';
import { Button } from 'primereact/button';

const Navbar = () => {
    const [visible, setVisible] = useState(false);

  const items = [
    {
       label: 'ParkingOS',
    }
  ];

  const start = <img alt="ParkingOS" src={ParkingOSImage.src} style={navbar_img_style} className="mr-2"></img>;
 const end = <Button icon="pi pi-arrow-right" onClick={() => setVisible(true)}/>

  return (
    <div style={navbar_div_style}>
      <Menubar model={items} start={start} end={end} />

      <MenuSidebar
            visible={visible} 
            onHide={() => setVisible(false)}
        />
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