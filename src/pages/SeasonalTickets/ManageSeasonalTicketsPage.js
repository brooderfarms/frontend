import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Card,
  CardContent,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Chip,
  CircularProgress,
  IconButton,
  Tooltip,
  TextField,
} from '@mui/material';
import {
  Edit,
  Delete,
  Add,
  ArrowBack,
  Visibility,
  FileDownload,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const ManageSeasonalTicketsPage = () => {
  const navigate = useNavigate();
  const { apiRequest, API_BASE_URL } = useAuth();
  const [seasonalTickets, setSeasonalTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchSeasonalTickets();
  }, []);

  const fetchSeasonalTickets = async () => {
    try {
      setLoading(true);
      setError('');
      // Fetch all seasonal tickets including drafts
      const response = await apiRequest(`${API_BASE_URL}/seasonal-tickets?include_drafts=true&limit=100`);
      
      if (!response.ok) throw new Error('Failed to fetch season passes');

      const data = await response.json();
      const tickets = Array.isArray(data.data) ? data.data : [];
      setSeasonalTickets(tickets);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message || 'Failed to load season passes');
      toast.error(err.message || 'Failed to load season passes');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (ticketId) => {
    setSelectedTicketId(ticketId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setDeleting(true);
      const response = await apiRequest(`${API_BASE_URL}/seasonal-tickets/${selectedTicketId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete season pass');

      setSeasonalTickets((prev) => prev.filter((t) => t.id !== selectedTicketId));
      toast.success('Season pass deleted successfully');
      setDeleteDialogOpen(false);
    } catch (err) {
      console.error('Delete error:', err);
      toast.error(err.message || 'Failed to delete season pass');
    } finally {
      setDeleting(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'default',
      published: 'success',
      archived: 'warning',
      sold_out: 'error',
    };
    return colors[status] || 'default';
  };

  const getStatusLabel = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
  };

  const filteredTickets = seasonalTickets.filter((ticket) => {
    const matchesSearch = ticket.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: seasonalTickets.length,
    published: seasonalTickets.filter((t) => t.status === 'published').length,
    draft: seasonalTickets.filter((t) => t.status === 'draft').length,
    soldOut: seasonalTickets.filter((t) => t.status === 'sold_out').length,
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/organizer')}
          variant="text"
        >
          Back to Dashboard
        </Button>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', mt: 2 }}>
          Manage Season Passes
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Passes
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                {stats.total}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Published
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                {stats.published}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Drafts
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'info.main' }}>
                {stats.draft}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Sold Out
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                {stats.soldOut}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Controls */}
      <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/create-seasonal-ticket')}
        >
          Create New Pass
        </Button>

        <TextField
          placeholder="Search season passes..."
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ flexGrow: 1, maxWidth: 300 }}
        />

        <TextField
          select
          label="Filter by Status"
          size="small"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          SelectProps={{ native: true }}
          sx={{ minWidth: 150 }}
        >
          <option value="all">All</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="sold_out">Sold Out</option>
        </TextField>
      </Box>

      {/* Table */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : filteredTickets.length > 0 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ bgcolor: 'grey.100' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="right">
                  Season
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="right">
                  Price
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="right">
                  Available
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="center">
                  Status
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="center">
                  Events
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="center">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTickets.map((ticket) => (
                <TableRow key={ticket.id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: '500' }}>
                      {ticket.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {ticket.description?.substring(0, 50)}...
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2">
                      {ticket.season_type} {ticket.season_year}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      ${ticket.season_price}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      (Was ${ticket.base_price})
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2">
                      {ticket.available_quantity - (ticket.sold_quantity || 0)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={getStatusLabel(ticket.status)}
                      color={getStatusColor(ticket.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2">
                      {ticket.event_count || 0}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/seasonal-tickets/${ticket.id}`)}
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/edit-seasonal-ticket/${ticket.id}`)}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteClick(ticket.id)}
                        color="error"
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Card>
          <CardContent sx={{ py: 8, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {searchTerm || filterStatus !== 'all'
                ? 'No season passes match your search'
                : 'No season passes yet'}
            </Typography>
            {!searchTerm && filterStatus === 'all' && (
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => navigate('/create-seasonal-ticket')}
              >
                Create Your First Pass
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Delete Season Pass?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Are you sure you want to delete this season pass? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={deleting}
          >
            {deleting ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ManageSeasonalTicketsPage;
