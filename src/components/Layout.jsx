// components/Layout.js
import React from 'react';
import Sidebar from './Sidebar';
import { Box, CssBaseline } from '@mui/material';
import AppHeader from './AppHeader';
import MainContent from './MainContent';
// Include any other imports you need

export default function Layout({ children, activeComponent, setActiveComponent }) {
  const [open, setOpen] = React.useState(true);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  // Calculate the grid cell width to fit 12-15 cells in a row
  // Using 15 cells (for tighter grid)
  const gridCellWidth = 100 / 15; // 6.66% of viewport width per cell

  return (
    <div>
      {/* Grid Background with 15 cells per row */}
      <Box 
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgb(183, 140, 219)',
          backgroundImage: `
            linear-gradient(to right, rgba(0, 0, 0, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 0, 0, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: `${gridCellWidth}% 100px`, // 15 columns, 100px rows
          zIndex: -1,
          '@keyframes gradientAnimation': {
            '0%': { backgroundPosition: '0% 0%' },
            '50%': { backgroundPosition: `${gridCellWidth/2}% 50px` },
            '100%': { backgroundPosition: '0% 0%' }
          },
          animation: 'gradientAnimation 15s ease infinite'
        }} 
      />
      
      <Box sx={{ display: 'flex', position: 'relative', zIndex: 1 }}>
        <CssBaseline />
        <AppHeader 
          open={open} 
          handleDrawerOpen={handleDrawerOpen} 
          handleDrawerClose={handleDrawerClose}
        />
        <Sidebar   
          open={open} 
          activeComponent={activeComponent}
          setActiveComponent={setActiveComponent} 
        />
        <MainContent>{children}</MainContent>
      </Box>
    </div>
  );
}