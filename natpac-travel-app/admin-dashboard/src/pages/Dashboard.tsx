import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
} from '@mui/material';
import {
  People,
  DirectionsBus,
  TrendingUp,
  LocationOn,
  Speed,
  Timeline,
  DirectionsWalk,
  DirectionsCar,
  Train,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { dashboardService } from '../services/dashboardService';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658'];

interface StatCard {
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
  color: string;
}

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [recentTrips, setRecentTrips] = useState<any[]>([]);
  const [tripTrends, setTripTrends] = useState<any[]>([]);
  const [modeDistribution, setModeDistribution] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, tripsData, trendsData, modesData] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getRecentTrips(),
        dashboardService.getTripTrends(),
        dashboardService.getModeDistribution(),
      ]);
      
      setStats(statsData);
      setRecentTrips(tripsData);
      setTripTrends(trendsData);
      setModeDistribution(modesData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards: StatCard[] = [
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      change: stats?.userGrowth || 0,
      icon: <People />,
      color: '#3f51b5',
    },
    {
      title: 'Total Trips',
      value: stats?.totalTrips || 0,
      change: stats?.tripGrowth || 0,
      icon: <DirectionsBus />,
      color: '#f50057',
    },
    {
      title: 'Active Today',
      value: stats?.activeToday || 0,
      change: stats?.activeGrowth || 0,
      icon: <TrendingUp />,
      color: '#00acc1',
    },
    {
      title: 'Avg Distance',
      value: `${stats?.avgDistance || 0} km`,
      change: stats?.distanceChange || 0,
      icon: <Speed />,
      color: '#43a047',
    },
  ];

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'walk': return <DirectionsWalk />;
      case 'car': return <DirectionsCar />;
      case 'bus': return <DirectionsBus />;
      case 'train': return <Train />;
      default: return <DirectionsBus />;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        {/* Stat Cards */}
        {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      {card.title}
                    </Typography>
                    <Typography variant="h4">
                      {card.value}
                    </Typography>
                    <Box display="flex" alignItems="center" mt={1}>
                      <TrendingUp
                        sx={{
                          color: card.change >= 0 ? 'success.main' : 'error.main',
                          fontSize: 16,
                          transform: card.change < 0 ? 'rotate(180deg)' : 'none',
                        }}
                      />
                      <Typography
                        variant="body2"
                        color={card.change >= 0 ? 'success.main' : 'error.main'}
                        sx={{ ml: 0.5 }}
                      >
                        {Math.abs(card.change)}%
                      </Typography>
                    </Box>
                  </Box>
                  <Avatar sx={{ bgcolor: card.color, width: 56, height: 56 }}>
                    {card.icon}
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {/* Trip Trends Chart */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Trip Trends (Last 7 Days)
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={tripTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="trips" stroke="#8884d8" />
                <Line type="monotone" dataKey="distance" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Mode Distribution */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Transport Mode Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={modeDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {modeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Recent Trips */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Trips
            </Typography>
            <List>
              {recentTrips.map((trip) => (
                <ListItem key={trip.id}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      {getModeIcon(trip.mode)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography>
                          {trip.origin} → {trip.destination}
                        </Typography>
                        <Chip label={trip.mode} size="small" />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          User: {trip.userName} • {new Date(trip.startTime).toLocaleString()}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Distance: {trip.distance} km • Duration: {trip.duration} min
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Time Distribution */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Trip Time Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats?.timeDistribution || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;