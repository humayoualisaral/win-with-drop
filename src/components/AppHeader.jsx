// AppHeader.jsx
"use client"
import * as React from 'react';
import { styled } from '@mui/material/styles';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';

const drawerWidth = 240;

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
  padding:"10px",
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  variants: [
    {
      props: ({ open }) => open,
      style: {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        padding:"10px",
        transition: theme.transitions.create(['width', 'margin'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
      },
    },
  ],
}));

const AppHeader = ({ open, handleDrawerOpen,handleDrawerClose }) => {
    const [isNavOpen,setIsNavOpen]=React.useState(true)
    const handleNav = () => {
        if (isNavOpen) {
          handleDrawerClose();
        } else {
          handleDrawerOpen(); // you'd need this function too
        }
        setIsNavOpen(!isNavOpen);
      };
      
  return (
    <AppBar position="fixed" open={open} 
     sx={[
        {
              background:"rgb(183 140 219)"
        }
     ]}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          onClick={()=>handleNav()}
          edge="start"
          sx={[
            {
              marginRight: 5,
            },
            // open && { display: 'none' },
          ]}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" noWrap component="div">
          Admin Dashboard
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

export default AppHeader;