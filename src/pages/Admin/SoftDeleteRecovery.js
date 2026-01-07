import React, { useState, useEffect } from 'react';
import {
  Container, Paper, Tabs, Tab, Box, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, CircularProgress, Alert, TextField, MenuItem, Card, CardContent, Grid,
  Typography, Pagination, FormControl, InputLabel, Select
} from '@mui/material';
import { Restore as RestoreIcon, Delete as DeleteIcon, Visibility as VisibilityIcon, Search as SearchIcon } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3800/api';

const SoftDeleteRecovery = () => {
  const { user } = useAuth();
  const [resourceType, setResourceType] = useState('events');
  const [deletedItems, setDeletedItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const itemsPerPage = 10;

  const token = localStorage.getItem('token');

  // Resource configurations
  const resourceConfigs = {
    events: {
      label: 'Events',
      endpoint: '/api/events',
      nameField: 'title',
      displayFields: ['title', 'description', 'deleted_at', 'organizer_id']
    },
    venues: {
      label: 'Venues',
      endpoint: '/api/venues',
      nameField: 'name',
      displayFields: ['name', 'city', 'state', 'deleted_at', 'manager_id']
    },
    tickets: {
      label: 'Tickets',
      endpoint: '/api/tickets',
      nameField: 'ticket_number',
      displayFields: ['ticket_number', 'event_id', 'user_id', 'status', 'deleted_at']
    },
    users: {
      label: 'Users',
      endpoint: '/api/users',
      nameField: 'email',
      displayFields: ['email', 'first_name', 'last_name', 'role', 'deleted_at']
    },
    merchandise: {
      label: 'Merchandise',
      endpoint: '/api/merchandise',
      nameField: 'name',
      displayFields: ['name', 'description', 'deleted_at']
    },
    ticket_templates: {
      label: 'Ticket Templates',
      endpoint: '/api/ticket-templates',
      nameField: 'name',
      displayFields: ['name', 'description', 'deleted_at']
    }
  };

  useEffect(() => {
    fetchDeletedItems();
  }, [resourceType, page, searchTerm]);

  const fetchDeletedItems = async () => {
    setLoading(true);
    setError('');
    try {
      const config = resourceConfigs[resourceType];
      const offset = (page - 1) * itemsPerPage;
      const url = new URL(`${API_BASE_URL}${config.endpoint}`);
      url.searchParams.append('showDeleted', 'true');
      url.searchParams.append('limit', itemsPerPage);
      url.searchParams.append('offset', offset);
      if (searchTerm) url.searchParams.append('search', searchTerm);

      const response = await fetch(url.toString(), {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setDeletedItems(data.data?.filter(item => item.deleted_at) || []);
        setTotalPages(Math.ceil((data.total || 0) / itemsPerPage));
      } else {
        setError(`Failed to load deleted ${resourceType}`);
      }
    } catch (err) {
      setError('Error: ' + err.message);
    }
    setLoading(false);
  };

  const handleRestore = async (itemId) => {
    if (!window.confirm(`Restore this ${resourceType.slice(0, -1)}?`)) return;

    setLoading(true);
    try {
      const config = resourceConfigs[resourceType];
      const response = await fetch(`${API_BASE_URL}${config.endpoint}/${itemId}/restore`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setSuccess(`${resourceType.slice(0, -1)} restored successfully`);
        fetchDeletedItems();
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to restore item');
      }
    } catch (err) {
      setError('Error: ' + err.message);
    }
    setLoading(false);
  };

  const handlePermanentDelete = async (itemId) => {
    if (!window.confirm('Permanently delete this item? This cannot be undone!')) return;

    setLoading(true);
    try {
      const config = resourceConfigs[resourceType];
      const response = await fetch(`${API_BASE_URL}${config.endpoint}/${itemId}/permanent-delete`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setSuccess('Item permanently deleted');
        fetchDeletedItems();
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to delete item');
      }
    } catch (err) {
      setError('Error: ' + err.message);
    }
    setLoading(false);
  };

  const handleViewDetails = (item) => {
    setSelectedItem(item);
    setDetailsDialog(true);
  };

  const config = resourceConfigs[resourceType];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <RestoreIcon sx={{ fontSize: 32 }} color="primary" />
        <Typography variant="h4">Soft-Deleted Items Recovery</Typography>
      </Box>

      {error && <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb: 2 }}>{success}</Alert>}

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {Object.entries(resourceConfigs).map(([key, cfg]) => (
          <Grid item xs={12} sm={6} md={4} key={key}>
            <Card
              sx={{
                cursor: 'pointer',
                backgroundColor: resourceType === key ? '#e3f2fd' : 'white',
                borderLeft: resourceType === key ? '4px solid #1976d2' : '4px solid #ccc',
                transition: 'all 0.2s',
                '&:hover': { boxShadow: 3 }
              }}
              onClick={() => {
                setResourceType(key);
                setPage(1);
              }}
            >
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  {cfg.label}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Search and Filter */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search by name, email, etc..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: 'gray' }} /> }}
            size="small"
            sx={{ flex: 1, minWidth: 200 }}
          />
        </Box>
      </Paper>

      {/* Deleted Items Table */}
      <TableContainer component={Paper}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : deletedItems.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center', color: 'gray' }}>
            <Typography>No deleted {resourceType} found</Typography>
          </Box>
        ) : (
          <>
            <Table size="small">
              <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell><strong>Item</strong></TableCell>
                  <TableCell><strong>Deleted At</strong></TableCell>
                  <TableCell><strong>Details</strong></TableCell>
                  <TableCell><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {deletedItems.map((item) => (
                  <TableRow key={item.id} sx={{ opacity: 0.7 }}>
                    <TableCell>
                      <Typography sx={{ textDecoration: 'line-through' }}>
                        {item[config.nameField] || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {item.deleted_at
                        ? new Date(item.deleted_at).toLocaleString()
                        : '-'
                      }
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<VisibilityIcon />}
                        onClick={() => handleViewDetails(item)}
                      >
                        View
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        color="success"
                        variant="contained"
                        startIcon={<RestoreIcon />}
                        onClick={() => handleRestore(item.id)}
                        sx={{ mr: 1 }}
                        disabled={loading}
                      >
                        Restore
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        variant="outlined"
                        startIcon={<DeleteIcon />}
                        onClick={() => handlePermanentDelete(item.id)}
                        disabled={loading}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            {totalPages > 1 && (
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(e, value) => setPage(value)}
                />
              </Box>
            )}
          </>
        )}
      </TableContainer>

      {/* Details Dialog */}
      <Dialog open={detailsDialog} onClose={() => setDetailsDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Item Details - {selectedItem?.[config?.nameField]}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {selectedItem && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {Object.entries(selectedItem).map(([key, value]) => (
                <Box key={key} sx={{ pb: 1, borderBottom: '1px solid #eee' }}>
                  <Typography variant="caption" color="textSecondary">
                    {key}
                  </Typography>
                  <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                    {value === null ? (
                      <em>null</em>
                    ) : typeof value === 'object' ? (
                      <code>{JSON.stringify(value, null, 2)}</code>
                    ) : (
                      value.toString()
                    )}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialog(false)}>Close</Button>
          <Button
            color="success"
            variant="contained"
            startIcon={<RestoreIcon />}
            onClick={() => {
              handleRestore(selectedItem.id);
              setDetailsDialog(false);
            }}
          >
            Restore This Item
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SoftDeleteRecovery;
