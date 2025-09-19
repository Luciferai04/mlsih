import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  Alert,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import {
  CloudDownload,
  FilterList,
  Description,
  InsertDriveFile,
  Download,
  Visibility,
  Delete,
} from '@mui/icons-material';
import dayjs, { Dayjs } from 'dayjs';
import { exportService } from '../services/exportService';

interface ExportJob {
  id: string;
  format: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
  completedAt?: Date;
  fileUrl?: string;
  recordCount?: number;
  filters: any;
}

const Export: React.FC = () => {
  const [startDate, setStartDate] = useState<Dayjs | null>(dayjs().subtract(30, 'day'));
  const [endDate, setEndDate] = useState<Dayjs | null>(dayjs());
  const [format, setFormat] = useState('csv');
  const [filters, setFilters] = useState({
    transportMode: '',
    tripPurpose: '',
    ageGroup: '',
    gender: '',
    minDistance: '',
    maxDistance: '',
  });
  const [loading, setLoading] = useState(false);
  const [exportJobs, setExportJobs] = useState<ExportJob[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const transportModes = ['walk', 'bicycle', 'bus', 'car', 'bike', 'train', 'auto'];
  const tripPurposes = ['work', 'education', 'shopping', 'leisure', 'medical', 'social', 'business', 'other'];
  const ageGroups = ['18-25', '26-35', '36-45', '46-60', '60+'];
  const genders = ['male', 'female', 'other'];

  const handleExport = async () => {
    if (!startDate || !endDate) {
      setMessage({ type: 'error', text: 'Please select date range' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const exportRequest = {
        format,
        startDate: startDate.format('YYYY-MM-DD'),
        endDate: endDate.format('YYYY-MM-DD'),
        filters: Object.entries(filters)
          .filter(([_, value]) => value !== '')
          .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {}),
      };

      const result = await exportService.createExport(exportRequest);
      
      setExportJobs(prev => [{
        id: result.exportId,
        format,
        status: 'processing',
        createdAt: new Date(),
        filters: exportRequest.filters,
      }, ...prev]);

      setMessage({ type: 'success', text: 'Export job created successfully. Processing...' });
      
      // Poll for status
      pollExportStatus(result.exportId);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to create export job' });
    } finally {
      setLoading(false);
    }
  };

  const pollExportStatus = async (exportId: string) => {
    const poll = setInterval(async () => {
      try {
        const status = await exportService.getExportStatus(exportId);
        
        setExportJobs(prev => prev.map(job => 
          job.id === exportId 
            ? { ...job, ...status }
            : job
        ));

        if (status.status === 'completed' || status.status === 'failed') {
          clearInterval(poll);
          if (status.status === 'completed') {
            setMessage({ type: 'success', text: 'Export completed successfully!' });
          } else {
            setMessage({ type: 'error', text: 'Export failed. Please try again.' });
          }
        }
      } catch (error) {
        clearInterval(poll);
        setMessage({ type: 'error', text: 'Failed to check export status' });
      }
    }, 3000);
  };

  const handleDownload = async (exportId: string, fileUrl?: string) => {
    if (!fileUrl) return;
    
    try {
      window.open(fileUrl, '_blank');
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to download file' });
    }
  };

  const clearFilters = () => {
    setFilters({
      transportMode: '',
      tripPurpose: '',
      ageGroup: '',
      gender: '',
      minDistance: '',
      maxDistance: '',
    });
  };

  const activeFiltersCount = Object.values(filters).filter(v => v !== '').length;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Export Trip Data
      </Typography>
      
      {message && (
        <Alert severity={message.type} onClose={() => setMessage(null)} sx={{ mb: 3 }}>
          {message.text}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Export Configuration
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={setStartDate}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="End Date"
                  value={endDate}
                  onChange={setEndDate}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Export Format</InputLabel>
                  <Select
                    value={format}
                    onChange={(e) => setFormat(e.target.value)}
                    label="Export Format"
                  >
                    <MenuItem value="csv">CSV (Excel Compatible)</MenuItem>
                    <MenuItem value="json">JSON</MenuItem>
                    <MenuItem value="geojson">GeoJSON (for GIS)</MenuItem>
                    <MenuItem value="xml">XML</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <FilterList />
                  <Typography variant="subtitle1">Filters</Typography>
                  {activeFiltersCount > 0 && (
                    <Chip 
                      label={`${activeFiltersCount} active`} 
                      size="small" 
                      onDelete={clearFilters}
                    />
                  )}
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Transport Mode</InputLabel>
                  <Select
                    value={filters.transportMode}
                    onChange={(e) => setFilters({ ...filters, transportMode: e.target.value })}
                    label="Transport Mode"
                  >
                    <MenuItem value="">All</MenuItem>
                    {transportModes.map(mode => (
                      <MenuItem key={mode} value={mode}>{mode}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Trip Purpose</InputLabel>
                  <Select
                    value={filters.tripPurpose}
                    onChange={(e) => setFilters({ ...filters, tripPurpose: e.target.value })}
                    label="Trip Purpose"
                  >
                    <MenuItem value="">All</MenuItem>
                    {tripPurposes.map(purpose => (
                      <MenuItem key={purpose} value={purpose}>{purpose}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Age Group</InputLabel>
                  <Select
                    value={filters.ageGroup}
                    onChange={(e) => setFilters({ ...filters, ageGroup: e.target.value })}
                    label="Age Group"
                  >
                    <MenuItem value="">All</MenuItem>
                    {ageGroups.map(age => (
                      <MenuItem key={age} value={age}>{age}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Gender</InputLabel>
                  <Select
                    value={filters.gender}
                    onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
                    label="Gender"
                  >
                    <MenuItem value="">All</MenuItem>
                    {genders.map(gender => (
                      <MenuItem key={gender} value={gender}>{gender}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Min Distance (km)"
                  type="number"
                  value={filters.minDistance}
                  onChange={(e) => setFilters({ ...filters, minDistance: e.target.value })}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Max Distance (km)"
                  type="number"
                  value={filters.maxDistance}
                  onChange={(e) => setFilters({ ...filters, maxDistance: e.target.value })}
                />
              </Grid>

              <Grid item xs={12}>
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  onClick={handleExport}
                  disabled={loading}
                  startIcon={<CloudDownload />}
                >
                  {loading ? 'Processing...' : 'Export Data'}
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Export Information
            </Typography>
            
            <Stack spacing={2}>
              <Alert severity="info">
                Exported data will be anonymized to protect user privacy. Personal information like phone numbers will not be included.
              </Alert>
              
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Available Fields:
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Trip origin/destination coordinates<br />
                  • Trip date, time, and duration<br />
                  • Transport mode and purpose<br />
                  • Distance traveled<br />
                  • Anonymous demographic data<br />
                  • Number of companions
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  File Size Limits:
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Maximum 100,000 records per export
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>

        {/* Export History */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Export History
            </Typography>
            
            {exportJobs.length === 0 ? (
              <Typography color="text.secondary">No export jobs yet</Typography>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Format</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Records</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {exportJobs.map((job) => (
                      <TableRow key={job.id}>
                        <TableCell>{job.createdAt.toLocaleString()}</TableCell>
                        <TableCell>
                          <Chip label={job.format.toUpperCase()} size="small" />
                        </TableCell>
                        <TableCell>
                          {job.status === 'processing' && <LinearProgress />}
                          {job.status === 'completed' && (
                            <Chip label="Completed" color="success" size="small" />
                          )}
                          {job.status === 'failed' && (
                            <Chip label="Failed" color="error" size="small" />
                          )}
                          {job.status === 'pending' && (
                            <Chip label="Pending" size="small" />
                          )}
                        </TableCell>
                        <TableCell>{job.recordCount || '-'}</TableCell>
                        <TableCell>
                          {job.status === 'completed' && job.fileUrl && (
                            <Tooltip title="Download">
                              <IconButton
                                onClick={() => handleDownload(job.id, job.fileUrl)}
                                color="primary"
                              >
                                <Download />
                              </IconButton>
                            </Tooltip>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Export;