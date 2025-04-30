"use client"
import * as React from 'react';
import { styled } from '@mui/material/styles';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import MenuIcon from '@mui/icons-material/Menu';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import { useMultiGiveaway } from '@/context/MultiGiveawayContext'; // Updated import
import { useActiveGiveaway } from '@/context/ActiveGiveaway';

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

const GiveawaySelector = styled(FormControl)(({ theme }) => ({
  margin: theme.spacing(0, 2),
  minWidth: 200,
  '& .MuiInputBase-root': {
    color: 'white',
    '&:before': {
      borderBottomColor: 'rgba(255, 255, 255, 0.7)',
    },
    '&:hover:not(.Mui-disabled):before': {
      borderBottomColor: 'white',
    },
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  '& .MuiSelect-icon': {
    color: 'white',
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: 'white',
  },
}));

const AppHeader = ({ open, handleDrawerOpen, handleDrawerClose }) => {
  const [isNavOpen, setIsNavOpen] = React.useState(true);
  const { account, disconnect, isConnected } = useMultiGiveaway(); // Updated to use MultiGiveaway context
  const { allGiveaways, activeGiveaway, changeActiveGiveaway } = useActiveGiveaway();
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
  
  const handleCloseDialog = () => {
    setDialogOpen(false);
  };
  
  const handleConfirmDisconnect = () => {
    // Use the disconnect function from MultiGiveaway context
    disconnect();
    
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

  // Handle giveaway selection change
  const handleGiveawayChange = (event) => {
    const selectedId = event.target.value;
    const selected = allGiveaways.find(giveaway => giveaway.id.toString() === selectedId.toString());
    if (selected) {
      changeActiveGiveaway(selected);
    }
  };
  
  return (
    <>
      <AppBar 
        position="fixed" 
        open={open} 
        sx={[
          {
            background: "#513763"
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
            {/* Giveaway Selector Dropdown */}
            {allGiveaways && allGiveaways.length > 0 && (
              <GiveawaySelector variant="outlined" size="small">
                <InputLabel id="active-giveaway-select-label" sx={{ color: 'white' }}>
                  Select Giveaway
                </InputLabel>
                <Select
                  labelId="active-giveaway-select-label"
                  id="active-giveaway-select"
                  value={activeGiveaway ? activeGiveaway.id.toString() : ''}
                  onChange={handleGiveawayChange}
                  label="Select Giveaway"
                  startAdornment={<CardGiftcardIcon sx={{ mr: 1, ml: -0.5 }} />}
                >
                  {allGiveaways.map((giveaway) => (
                    <MenuItem key={giveaway.id.toString()} value={giveaway.id.toString()}>
                      {giveaway.name} {giveaway.active ? "(Active)" : "(Inactive)"}
                    </MenuItem>
                  ))}
                </Select>
              </GiveawaySelector>
            )}
            
            {/* Wallet display section */}
            {isConnected && account && (
              <>
                <WalletAddressDisplay>
                  <AccountBalanceWalletIcon fontSize="small" />
                  <Typography variant="body2" noWrap>
                    {formatAddress(account)}
                  </Typography>
                </WalletAddressDisplay>
                
                
              </>
            )}
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