import React, { useState } from 'react';
import { Menubar } from 'primereact/menubar';
import ParkingOSImage from "../../public/ParkingOS_icon.png";
import MenuSidebar from './Sidebar';
import { Button } from 'primereact/button';
import { MySecondaryButton } from './MyButtons';

const Navbar = ({ showMenuBtn = true }) => {
    const [visible, setVisible] = useState(false);

  const items = [
    {
       label: 'ParkingOS',
    }
  ];

  const start = <img alt="ParkingOS" src={ParkingOSImage.src} style={navbar_img_style} className="mr-2"></img>;
 const end = <MySecondaryButton label="Menu" onClick={() => setVisible(true)}/>

  return (
    <div style={navbar_div_style}>
      {showMenuBtn ? (
          <Menubar model={items} start={start} end={end} />
        ) : (
          <Menubar model={items} start={start} />
        )}

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