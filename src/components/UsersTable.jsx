import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const columns = [
  { 
    field: 'txId', 
    headerName: 'Transaction ID', 
    width: 220,
    renderCell: (params) => (
      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
        {params.value}
      </Typography>
    )
  },
  { 
    field: 'adminAddress', 
    headerName: 'Admin Address', 
    width: 200,
    renderCell: (params) => (
      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
        {params.value}
      </Typography>
    )
  },
  { 
    field: 'userAddress', 
    headerName: 'User Address', 
    width: 200,
    renderCell: (params) => (
      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
        {params.value}
      </Typography>
    )
  },
  {
    field: 'timestamp',
    headerName: 'Timestamp',
    width: 180,
  },
];

// Blockchain-style dummy data
const rows = [
  { 
    id: 1, 
    txId: '0x7ac43aa8d4d969d065a39e2853cb78956f464f26e936c9fae7f3ec36295a4157', 
    adminAddress: '0x23F8C8e516592977765d02d09AE1f2c7E9db08d3', 
    userAddress: '0x8a7B54D85Fd275F797e35e17A9eCec4B142184Ca', 
    timestamp: '2025-04-20 09:12:33'
  },
  { 
    id: 2, 
    txId: '0x5db28b613c616f833c5cc9f1d85210fb71c9c23ca3a00ce2abe8aa98323800dd', 
    adminAddress: '0x23F8C8e516592977765d02d09AE1f2c7E9db08d3', 
    userAddress: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', 
    timestamp: '2025-04-20 08:45:17'
  },
  { 
    id: 3, 
    txId: '0x99c5c78d72e374cf48f36d32a6cc9beebdea09fba92fd05451c2c5f9c2cd69a1', 
    adminAddress: '0x3e2A8FFc7BdA3460769Ce076c4236b1876FdA218', 
    userAddress: '0x8a7B54D85Fd275F797e35e17A9eCec4B142184Ca', 
    timestamp: '2025-04-19 23:01:48'
  },
  { 
    id: 4, 
    txId: '0x1b76cf350401b2ffc8a7abf63e17993a5a0458d904d65421eb8a4c8ecfc9a1dc', 
    adminAddress: '0x23F8C8e516592977765d02d09AE1f2c7E9db08d3', 
    userAddress: '0xD01ef7C0A6737ba3b5310C71B5C634982F4321e2', 
    timestamp: '2025-04-19 20:33:12'
  },
  { 
    id: 5, 
    txId: '0xc8f18a271a069b8c719460eff3c9818d9bfb4e3774991286afc5b350d9dd4367', 
    adminAddress: '0x3e2A8FFc7BdA3460769Ce076c4236b1876FdA218', 
    userAddress: '0x4b15a25C15CaE78f4CcDbC2073c29550B8c25dBf', 
    timestamp: '2025-04-19 16:27:54'
  },
  { 
    id: 6, 
    txId: '0xf26d9eee53f3db81bef796a53b30331c0b9512051c9a2b81fc3fd12422a97a2c', 
    adminAddress: '0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc', 
    userAddress: '0xD01ef7C0A6737ba3b5310C71B5C634982F4321e2', 
    timestamp: '2025-04-19 12:18:09'
  },
  { 
    id: 7, 
    txId: '0x8adeec79d06a42b2640f12b44167ce8910dcee48ecd50d9d02ea019c82c783c3', 
    adminAddress: '0x23F8C8e516592977765d02d09AE1f2c7E9db08d3', 
    userAddress: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', 
    timestamp: '2025-04-19 09:05:23'
  },
  { 
    id: 8, 
    txId: '0x3ad8dcf7e6fb13c1c187628b1b74726caa070c92e0bc8318edc65e07aad93d31', 
    adminAddress: '0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc', 
    userAddress: '0x8a7B54D85Fd275F797e35e17A9eCec4B142184Ca', 
    timestamp: '2025-04-18 23:42:18'
  },
  { 
    id: 9, 
    txId: '0x61e9dc5a8847a5fe8dc49ba12ed0c8e7bfc75d5c7c1eec3fef0c2c3fa09bb9b3', 
    adminAddress: '0x3e2A8FFc7BdA3460769Ce076c4236b1876FdA218', 
    userAddress: '0x4b15a25C15CaE78f4CcDbC2073c29550B8c25dBf', 
    timestamp: '2025-04-18 16:59:54'
  },
];

export default function BlockchainTransactionsTable() {
  const [paginationModel, setPaginationModel] = React.useState({
    page: 0,
    pageSize: 5,
  });

  return (
    <Paper elevation={3}>
      <Box p={2}>
        {/* Custom Header */}
        <Typography variant="h6" gutterBottom>
          BLOCKCHAIN TRANSACTIONS
        </Typography>
        
        {/* DataGrid */}
        <Box sx={{ height: 400, width: '100%' }}>
          <DataGrid
            rows={rows}
            columns={columns}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            pageSizeOptions={[5, 10]}
            disableRowSelectionOnClick
          />
        </Box>
      </Box>
    </Paper>
  );
}