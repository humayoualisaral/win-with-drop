// components/Layout.js
import React from 'react';
import Sidebar from './Sidebar';
import { Box, CssBaseline } from '@mui/material';
import AppHeader from './AppHeader';
import MainContent from './MainContent';
// Include any other imports you need

export default function Layout({ children, activeComponent, setActiveComponent }) {
  const [open, setOpen] = React.useState(false);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  return (
    <div className="flex">
  
 
      <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppHeader open={open} handleDrawerOpen={handleDrawerOpen} handleDrawerClose={handleDrawerClose}/>
      <Sidebar   open={open} 
        activeComponent={activeComponent}
        setActiveComponent={setActiveComponent} />
      <MainContent>{children}</MainContent>
    </Box>
    </div>
  );
}