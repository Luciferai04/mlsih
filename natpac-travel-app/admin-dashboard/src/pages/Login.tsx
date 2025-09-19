import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const Login: React.FC = () => {
  return (
    <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4">NATPAC Admin Login</Typography>
        <Typography>Login page implementation pending...</Typography>
      </Paper>
    </Box>
  );
};

export default Login;