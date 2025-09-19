import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Tab,
  Tabs,
  Button,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CloudQueue as WeatherIcon,
  Business as BusinessIcon,
  LocalHospital as EmergencyIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`kerala-tabpanel-${index}`}
      aria-labelledby={`kerala-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const KeralaManagement: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState<'weather' | 'business' | 'emergency' | 'alert'>('business');
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // Mock data
  const [weatherAlerts, setWeatherAlerts] = useState([
    {
      id: 1,
      title: 'Monsoon Heavy Rainfall',
      district: 'Idukki',
      severity: 'high',
      validFrom: '2024-01-20',
      validUntil: '2024-01-25',
      description: 'Heavy rainfall expected in hilly areas',
    },
    {
      id: 2,
      title: 'Heat Wave Advisory',
      district: 'Palakkad',
      severity: 'medium',
      validFrom: '2024-03-01',
      validUntil: '2024-03-15',
      description: 'Temperature may rise above 40°C',
    },
  ]);

  const [localBusinesses, setLocalBusinesses] = useState([
    {
      id: 1,
      name: 'Kerala Heritage Hotel',
      type: 'hotel',
      district: 'Ernakulam',
      verified: true,
      rating: 4.8,
      contact: '+91 484 2215666',
      featured: true,
    },
    {
      id: 2,
      name: 'Malabar Spice Kitchen',
      type: 'restaurant',
      district: 'Kozhikode',
      verified: true,
      rating: 4.6,
      contact: '+91 495 2371234',
      featured: false,
    },
  ]);

  const [emergencyServices, setEmergencyServices] = useState([
    {
      id: 1,
      name: 'General Hospital Ernakulam',
      type: 'hospital',
      district: 'Ernakulam',
      contact: '0484-2358001',
      available24x7: true,
      address: 'Hospital Road, Ernakulam',
    },
    {
      id: 2,
      name: 'Fire Station Kochi',
      type: 'fire',
      district: 'Ernakulam',
      contact: '101',
      available24x7: true,
      address: 'Shanmugham Road, Kochi',
    },
  ]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleOpenDialog = (type: 'weather' | 'business' | 'emergency' | 'alert', item?: any) => {
    setDialogType(type);
    setSelectedItem(item || null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedItem(null);
  };

  const weatherColumns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'title', headerName: 'Alert Title', width: 200 },
    { field: 'district', headerName: 'District', width: 130 },
    {
      field: 'severity',
      headerName: 'Severity',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={
            params.value === 'high' ? 'error' : params.value === 'medium' ? 'warning' : 'success'
          }
          size="small"
        />
      ),
    },
    { field: 'validFrom', headerName: 'Valid From', width: 120 },
    { field: 'validUntil', headerName: 'Valid Until', width: 120 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      renderCell: (params) => (
        <>
          <IconButton size="small" onClick={() => handleOpenDialog('weather', params.row)}>
            <EditIcon />
          </IconButton>
          <IconButton size="small" color="error">
            <DeleteIcon />
          </IconButton>
        </>
      ),
    },
  ];

  const businessColumns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Business Name', width: 200 },
    { field: 'type', headerName: 'Type', width: 100 },
    { field: 'district', headerName: 'District', width: 130 },
    {
      field: 'verified',
      headerName: 'Verified',
      width: 90,
      renderCell: (params) => (
        <Chip label={params.value ? 'Yes' : 'No'} color={params.value ? 'success' : 'default'} size="small" />
      ),
    },
    { field: 'rating', headerName: 'Rating', width: 80 },
    {
      field: 'featured',
      headerName: 'Featured',
      width: 100,
      renderCell: (params) => (
        <Switch checked={params.value} size="small" />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      renderCell: (params) => (
        <>
          <IconButton size="small" onClick={() => handleOpenDialog('business', params.row)}>
            <EditIcon />
          </IconButton>
          <IconButton size="small" color="error">
            <DeleteIcon />
          </IconButton>
        </>
      ),
    },
  ];

  const emergencyColumns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Service Name', width: 200 },
    { field: 'type', headerName: 'Type', width: 100 },
    { field: 'district', headerName: 'District', width: 130 },
    { field: 'contact', headerName: 'Contact', width: 150 },
    {
      field: 'available24x7',
      headerName: '24x7',
      width: 80,
      renderCell: (params) => (
        <Chip label={params.value ? '24x7' : 'Limited'} color={params.value ? 'success' : 'default'} size="small" />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      renderCell: (params) => (
        <>
          <IconButton size="small" onClick={() => handleOpenDialog('emergency', params.row)}>
            <EditIcon />
          </IconButton>
          <IconButton size="small" color="error">
            <DeleteIcon />
          </IconButton>
        </>
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Kerala Features Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={() => {}}
        >
          Refresh Data
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <WeatherIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Weather Alerts</Typography>
              </Box>
              <Typography variant="h3">{weatherAlerts.length}</Typography>
              <Typography variant="body2" color="text.secondary">
                Active alerts
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <BusinessIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">Local Businesses</Typography>
              </Box>
              <Typography variant="h3">{localBusinesses.length}</Typography>
              <Typography variant="body2" color="text.secondary">
                Registered businesses
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <EmergencyIcon color="error" sx={{ mr: 1 }} />
                <Typography variant="h6">Emergency Services</Typography>
              </Box>
              <Typography variant="h3">{emergencyServices.length}</Typography>
              <Typography variant="body2" color="text.secondary">
                Available services
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <InfoIcon color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">Tourist Info</Typography>
              </Box>
              <Typography variant="h3">14</Typography>
              <Typography variant="body2" color="text.secondary">
                Active advisories
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ width: '100%' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="kerala management tabs">
          <Tab icon={<WeatherIcon />} label="Weather Alerts" />
          <Tab icon={<BusinessIcon />} label="Local Businesses" />
          <Tab icon={<EmergencyIcon />} label="Emergency Services" />
          <Tab icon={<InfoIcon />} label="Tourist Advisories" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Box sx={{ mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog('weather')}
            >
              Add Weather Alert
            </Button>
          </Box>
          <DataGrid
            rows={weatherAlerts}
            columns={weatherColumns}
            pageSize={10}
            rowsPerPageOptions={[10]}
            checkboxSelection
            disableSelectionOnClick
            autoHeight
          />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog('business')}
            >
              Add Business
            </Button>
          </Box>
          <DataGrid
            rows={localBusinesses}
            columns={businessColumns}
            pageSize={10}
            rowsPerPageOptions={[10]}
            checkboxSelection
            disableSelectionOnClick
            autoHeight
          />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Box sx={{ mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog('emergency')}
            >
              Add Emergency Service
            </Button>
          </Box>
          <DataGrid
            rows={emergencyServices}
            columns={emergencyColumns}
            pageSize={10}
            rowsPerPageOptions={[10]}
            checkboxSelection
            disableSelectionOnClick
            autoHeight
          />
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Alert severity="info" sx={{ mb: 2 }}>
            Tourist advisories feature coming soon. This will include travel tips, cultural events, and seasonal recommendations for Kerala.
          </Alert>
        </TabPanel>
      </Paper>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedItem ? 'Edit' : 'Add'} {dialogType === 'weather' ? 'Weather Alert' : dialogType === 'business' ? 'Business' : 'Emergency Service'}
        </DialogTitle>
        <DialogContent>
          {dialogType === 'weather' && (
            <Box sx={{ pt: 2 }}>
              <TextField
                fullWidth
                label="Alert Title"
                margin="normal"
                defaultValue={selectedItem?.title}
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>District</InputLabel>
                <Select defaultValue={selectedItem?.district || ''}>
                  <MenuItem value="Thiruvananthapuram">Thiruvananthapuram</MenuItem>
                  <MenuItem value="Kollam">Kollam</MenuItem>
                  <MenuItem value="Pathanamthitta">Pathanamthitta</MenuItem>
                  <MenuItem value="Alappuzha">Alappuzha</MenuItem>
                  <MenuItem value="Kottayam">Kottayam</MenuItem>
                  <MenuItem value="Idukki">Idukki</MenuItem>
                  <MenuItem value="Ernakulam">Ernakulam</MenuItem>
                  <MenuItem value="Thrissur">Thrissur</MenuItem>
                  <MenuItem value="Palakkad">Palakkad</MenuItem>
                  <MenuItem value="Malappuram">Malappuram</MenuItem>
                  <MenuItem value="Kozhikode">Kozhikode</MenuItem>
                  <MenuItem value="Wayanad">Wayanad</MenuItem>
                  <MenuItem value="Kannur">Kannur</MenuItem>
                  <MenuItem value="Kasaragod">Kasaragod</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth margin="normal">
                <InputLabel>Severity</InputLabel>
                <Select defaultValue={selectedItem?.severity || ''}>
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Description"
                margin="normal"
                multiline
                rows={3}
                defaultValue={selectedItem?.description}
              />
            </Box>
          )}

          {dialogType === 'business' && (
            <Box sx={{ pt: 2 }}>
              <TextField
                fullWidth
                label="Business Name"
                margin="normal"
                defaultValue={selectedItem?.name}
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Type</InputLabel>
                <Select defaultValue={selectedItem?.type || ''}>
                  <MenuItem value="restaurant">Restaurant</MenuItem>
                  <MenuItem value="hotel">Hotel</MenuItem>
                  <MenuItem value="shop">Shop</MenuItem>
                  <MenuItem value="attraction">Tourist Attraction</MenuItem>
                  <MenuItem value="transport">Transport Service</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Contact"
                margin="normal"
                defaultValue={selectedItem?.contact}
              />
              <FormControlLabel
                control={<Switch defaultChecked={selectedItem?.verified} />}
                label="Verified Business"
              />
              <FormControlLabel
                control={<Switch defaultChecked={selectedItem?.featured} />}
                label="Featured Business"
              />
            </Box>
          )}

          {dialogType === 'emergency' && (
            <Box sx={{ pt: 2 }}>
              <TextField
                fullWidth
                label="Service Name"
                margin="normal"
                defaultValue={selectedItem?.name}
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Type</InputLabel>
                <Select defaultValue={selectedItem?.type || ''}>
                  <MenuItem value="hospital">Hospital</MenuItem>
                  <MenuItem value="police">Police Station</MenuItem>
                  <MenuItem value="fire">Fire Station</MenuItem>
                  <MenuItem value="ambulance">Ambulance Service</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Contact Number"
                margin="normal"
                defaultValue={selectedItem?.contact}
              />
              <TextField
                fullWidth
                label="Address"
                margin="normal"
                multiline
                rows={2}
                defaultValue={selectedItem?.address}
              />
              <FormControlLabel
                control={<Switch defaultChecked={selectedItem?.available24x7} />}
                label="Available 24x7"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleCloseDialog} variant="contained">
            {selectedItem ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default KeralaManagement;