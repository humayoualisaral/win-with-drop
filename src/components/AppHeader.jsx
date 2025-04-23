// AppHeader.jsx
"use client"
import * as React from 'react';
import { styled } from '@mui/material/styles';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import MenuIcon from '@mui/icons-material/Menu';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import LogoutIcon from '@mui/icons-material/Logout';
import { useWallet } from '@/context/WalletContext';

const drawerWidth = 240;

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
  padding: "10px",
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
        padding: "10px",
        transition: theme.transitions.create(['width', 'margin'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
      },
    },
  ],
}));

const WalletAddressDisplay = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  backgroundColor: 'rgba(255, 255, 255, 0.15)',
  borderRadius: theme.shape.borderRadius,
  padding: '4px 12px',
  marginRight: '16px',
  '& .MuiSvgIcon-root': {
    marginRight: theme.spacing(1),
  },
}));

const AppHeader = ({ open, handleDrawerOpen, handleDrawerClose }) => {
  const [isNavOpen, setIsNavOpen] = React.useState(true);
  const { account } = useWallet();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = React.useState(false);
  
  // Format wallet address for display (0x1234...5678)
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const handleNav = () => {
    if (isNavOpen) {
      handleDrawerClose();
    } else {
      handleDrawerOpen();
    }
    setIsNavOpen(!isNavOpen);
  };
  
  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };
  
  const handleConfirmDisconnect = () => {
    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('walletConnected');
      // Any other connection data you might be storing
    }
    
    setDialogOpen(false);
    setSuccessDialogOpen(true);
    
    // Auto close success dialog after 2 seconds
    setTimeout(() => {
      setSuccessDialogOpen(false);
      window.location.reload();
    }, 2000);
  };
  
  return (
    <>
      <AppBar 
        position="fixed" 
        open={open} 
        sx={[
          {
            background: "rgb(183 140 219)"
          }
        ]}
      >
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={() => handleNav()}
              edge="start"
              sx={[
                {
                  marginRight: 5,
                },
              ]}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div">
              Admin Dashboard
            </Typography>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {account && (
              <WalletAddressDisplay>
                <AccountBalanceWalletIcon fontSize="small" />
                <Typography variant="body2" noWrap>
                  {formatAddress(account)}
                </Typography>
              </WalletAddressDisplay>
            )}
            
            {/* <Button
              variant="contained"
              color="error"
              size="small"
              startIcon={<LogoutIcon />}
              onClick={handleOpenDialog}
              sx={{
                backgroundColor: 'rgba(211, 47, 47, 0.8)',
                '&:hover': {
                  backgroundColor: 'rgba(211, 47, 47, 1)',
                },
              }}
            >
              Disconnect
            </Button> */}
          </div>
        </Toolbar>
      </AppBar>
      
      {/* Confirmation Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Disconnect Wallet"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to disconnect your wallet?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">Cancel</Button>
          <Button onClick={handleConfirmDisconnect} color="error" autoFocus>
            Yes, disconnect
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Success Dialog */}
      <Dialog
        open={successDialogOpen}
        aria-labelledby="success-dialog-title"
      >
        <DialogTitle id="success-dialog-title">
          {"Disconnected!"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Your wallet has been disconnected.
          </DialogContentText>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AppHeader;