import React from 'react';
import { Menubar } from 'primereact/menubar';

const Navbar = () => {
  const items = [
    {
       label: 'Home',
       icon: 'pi pi-fw pi-home',
       // Add command or url here
    },
    {
       label: 'About',
       icon: 'pi pi-fw pi-info-circle',
       // Add command or url here
    },
    {
       label: 'Contact',
       icon: 'pi pi-fw pi-phone',
       // Add command or url here
    },
    // ... other items
  ];

  return (
    <div>
      <Menubar model={items} />
    </div>
  );
};

export default Navbar;