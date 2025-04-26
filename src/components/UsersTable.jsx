import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import { useMultiGiveaway } from '@/context/MultiGiveawayContext';
import { 
  Badge, 
  Card, 
  CardHeader, 
  Divider, 
  IconButton, 
  Tooltip 
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import PersonIcon from '@mui/icons-material/Person';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

export default function ParticipantsTable({ giveawayId }) {
  const [participants, setParticipants] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const { getGiveawayParticipants } = useMultiGiveaway();
  const [totalParticipants, setTotalParticipants] = React.useState(0);
  const [totalWinners, setTotalWinners] = React.useState(0);

  const [paginationModel, setPaginationModel] = React.useState({
    page: 0,
    pageSize: 10,
  });

  // Define columns for the DataGrid with enhanced styling
  const columns = [
    { 
      field: 'index', 
      headerName: 'ID', 
      width: 80,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <Typography 
          variant="body2" 
          sx={{ 
            fontFamily: 'monospace',
            backgroundColor: '#f0f2f5',
            padding: '4px 8px',
            borderRadius: '4px',
            fontWeight: 'bold'
          }}
        >
          #{params.value + 1}
        </Typography>
      )
    },
    { 
      field: 'email', 
      headerName: 'Email Address', 
      flex: 1,
      minWidth: 250,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <PersonIcon sx={{ color: '#64748b', mr: 1, fontSize: 18 }} />
          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
            {params.value}
          </Typography>
        </Box>
      )
    },
    { 
      field: 'hasWon', 
      headerName: 'Status', 
      width: 150,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        params.value ? (
          <Chip 
            icon={<EmojiEventsIcon />} 
            label="Winner" 
            color="primary" 
            variant="outlined"
            sx={{ 
              fontWeight: 'bold',
              backgroundColor: 'rgba(46, 204, 113, 0.1)',
              borderColor: 'rgba(46, 204, 113, 0.5)',
              color: '#2ecc71',
              '& .MuiChip-icon': { color: '#2ecc71' }
            }}
          />
        ) : (
          <Chip 
            label="Participant" 
            variant="outlined"
            sx={{ 
              color: '#64748b',
              borderColor: '#cbd5e1'
            }}
          />
        )
      )
    },
  ];

  // Fetch participants data when component mounts or giveawayId changes
  React.useEffect(() => {
    const fetchParticipants = async () => {
      if (!giveawayId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Call the contract method to get participants
        const participantsData = await getGiveawayParticipants(giveawayId);
        
        // Format data for the DataGrid
        const formattedData = participantsData.map(participant => ({
          id: participant.index,
          ...participant
        }));
        console.log(participantsData,"this is data")
        console.log(giveawayId,)
        setParticipants(formattedData);
        setTotalParticipants(formattedData.length);
        setTotalWinners(formattedData.filter(p => p.hasWon).length);
      } catch (err) {
        console.error("Error fetching participants:", err);
        setError(`Failed to load participants: ${err.message || "Unknown error"}`);
      } finally {
        setLoading(false);
      }
    };

    fetchParticipants();
    // Only depend on giveawayId to prevent reload loops
  }, [giveawayId]);

  // Manual refresh function - separate from the effect
  const handleRefresh = async () => {
    if (!giveawayId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const participantsData = await getGiveawayParticipants(giveawayId);
      
      const formattedData = participantsData.map(participant => ({
        id: participant.index,
        ...participant
      }));
      
      setParticipants(formattedData);
      setTotalParticipants(formattedData.length);
      setTotalWinners(formattedData.filter(p => p.hasWon).length);
    } catch (err) {
      console.error("Error fetching participants:", err);
      setError(`Failed to load participants: ${err.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
              Giveaway Participants
            </Typography>
            <Chip 
              label={`#${giveawayId}`} 
              size="small" 
              sx={{ ml: 1, backgroundColor: '#f0f2f5', fontWeight: 'bold' }} 
            />
          </Box>
        }
        action={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Badge 
              badgeContent={totalWinners} 
              color="primary" 
              sx={{ mr: 2 }}
              max={999}
            >
              <Tooltip title="Total Winners">
                <EmojiEventsIcon sx={{ color: '#2ecc71' }} />
              </Tooltip>
            </Badge>
            <Badge 
              badgeContent={totalParticipants} 
              color="default" 
              sx={{ mr: 2 }}
              max={999}
            >
              <Tooltip title="Total Participants">
                <PersonIcon sx={{ color: '#64748b' }} />
              </Tooltip>
            </Badge>
            <Tooltip title="Refresh Data">
              <IconButton onClick={handleRefresh} disabled={loading} size="small">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        }
        sx={{ 
          backgroundColor: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          pb: 1
        }}
      />
      
      <Divider />
      
      <Box sx={{ p: 0 }}>
        {/* Loading indicator */}
        {loading && (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
            <CircularProgress size={40} thickness={4} />
          </Box>
        )}
        
        {/* Error message */}
        {error && (
          <Box p={2}>
            <Alert 
              severity="error" 
              variant="outlined"
              sx={{ borderRadius: 1 }}
            >
              {error}
            </Alert>
          </Box>
        )}
        
        {/* Empty state */}
        {!loading && participants.length === 0 && !error && (
          <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" p={4} minHeight={200}>
            <PersonIcon sx={{ fontSize: 48, color: '#cbd5e1', mb: 2 }} />
            <Typography variant="body1" color="text.secondary">
              No participants found for this giveaway.
            </Typography>
          </Box>
        )}
        
        {/* DataGrid */}
        {!loading && participants.length > 0 && (
          <Box sx={{ height: 500, width: '100%' }}>
            <DataGrid
              rows={participants}
              columns={columns}
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
              pageSizeOptions={[10, 25, 50, 100]}
              disableRowSelectionOnClick
              getRowClassName={(params) => 
                params.row.hasWon ? 'winner-row' : ''
              }
              sx={{
                '& .winner-row': {
                  backgroundColor: 'rgba(46, 204, 113, 0.05)',
                },
                '& .MuiDataGrid-cell:focus': {
                  outline: 'none'
                },
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: '#f8fafc',
                  borderBottom: '1px solid #e2e8f0',
                },
                '& .MuiDataGrid-footerContainer': {
                  backgroundColor: '#f8fafc',
                  borderTop: '1px solid #e2e8f0',
                },
                border: 'none',
                '& .MuiDataGrid-withBorderColor': {
                  borderColor: '#e2e8f0',
                },
                '& .MuiDataGrid-row:hover': {
                  backgroundColor: '#f1f5f9',
                },
                '& .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-cell:focus': {
                  outline: 'none',
                }
              }}
            />
          </Box>
        )}
      </Box>
    </Card>
  );
}