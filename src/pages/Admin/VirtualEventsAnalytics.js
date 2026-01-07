import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
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
import {
  Videocam,
  TrendingUp,
  People,
  AttachMoney,
  Star,
  Analytics,
  Event,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const VirtualEventsAnalytics = () => {
  const { apiRequest, API_BASE_URL } = useAuth();
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30days');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await apiRequest(
        `${API_BASE_URL}/analytics/virtual-events?timeRange=${timeRange}`
      );

      if (response.ok) {
        const data = await response.json();
        setAnalyticsData(data.data);
      }
    } catch (err) {
      console.error('Fetch analytics error:', err);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!analyticsData) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">Failed to load analytics data</Alert>
      </Container>
    );
  }

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1'];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Analytics sx={{ fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
            Virtual Events Analytics
          </Typography>
        </Box>
        <Typography variant="body1" color="textSecondary">
          Monitor performance and engagement metrics for your virtual events
        </Typography>
      </Box>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Total Virtual Events */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography color="textSecondary" gutterBottom>
                  Total Virtual Events
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {analyticsData.totalVirtualEvents}
                </Typography>
              </Box>
              <Videocam sx={{ fontSize: 32, color: 'primary.main' }} />
            </Box>
          </Paper>
        </Grid>

        {/* Total Attendees */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography color="textSecondary" gutterBottom>
                  Total Attendees
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {analyticsData.totalAttendees.toLocaleString()}
                </Typography>
              </Box>
              <People sx={{ fontSize: 32, color: 'success.main' }} />
            </Box>
          </Paper>
        </Grid>

        {/* Total Revenue */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography color="textSecondary" gutterBottom>
                  Total Revenue
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  ${analyticsData.totalRevenue.toFixed(2)}
                </Typography>
              </Box>
              <AttachMoney sx={{ fontSize: 32, color: 'warning.main' }} />
            </Box>
          </Paper>
        </Grid>

        {/* Average Rating */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography color="textSecondary" gutterBottom>
                  Average Rating
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {analyticsData.averageRating.toFixed(1)} ⭐
                </Typography>
              </Box>
              <Star sx={{ fontSize: 32, color: 'error.main' }} />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Charts Row 1 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Attendees Over Time */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              Attendees Over Time
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData.attendeesOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="attendees"
                  stroke="#8884d8"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Event Types Distribution */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              Events by Type
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analyticsData.eventTypeDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name} (${value})`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analyticsData.eventTypeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Charts Row 2 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Revenue by Event Type */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              Revenue by Event Type
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.revenueByType}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="revenue" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Platform Usage */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              Meeting Platform Usage
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.platformUsage}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="platform" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8dd1e1" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Top Events */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
          Top Performing Virtual Events
        </Typography>

        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: 'grey.100' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Event Title</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                  Attendees
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                  Revenue
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                  Rating
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                  Status
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {analyticsData.topEvents.map((event, idx) => (
                <TableRow key={idx} hover>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {event.title}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {event.type}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Chip
                      icon={<People />}
                      label={event.attendees}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Typography sx={{ fontWeight: 'bold', color: 'success.main' }}>
                      ${event.revenue.toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    {event.rating && (
                      <Chip
                        label={`${event.rating.toFixed(1)} ⭐`}
                        size="small"
                        color="warning"
                        variant="outlined"
                      />
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Chip
                      label={event.status}
                      size="small"
                      color={
                        event.status === 'completed'
                          ? 'success'
                          : event.status === 'in-progress'
                          ? 'primary'
                          : 'default'
                      }
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Engagement Metrics */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              Feature Usage
            </Typography>

            {analyticsData.featureUsage.map((feature) => (
              <Box key={feature.name} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">{feature.name}</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {feature.percentage}%
                  </Typography>
                </Box>
                <Box
                  sx={{
                    height: 8,
                    bgcolor: 'grey.200',
                    borderRadius: 4,
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    sx={{
                      height: '100%',
                      width: `${feature.percentage}%`,
                      bgcolor: 'primary.main',
                      transition: 'width 0.3s',
                    }}
                  />
                </Box>
              </Box>
            ))}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              Attendance Stats
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Avg. Completion Rate
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {analyticsData.avgCompletionRate}%
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Attendee Satisfaction
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {analyticsData.attendeeSatisfaction}%
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Avg. Session Duration
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {analyticsData.avgSessionDuration} min
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Certificate Rate
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {analyticsData.certificateRate}%
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default VirtualEventsAnalytics;
