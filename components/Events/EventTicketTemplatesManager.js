import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  IconButton,
  Chip,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
} from '@mui/material';
import {
  Add,
  Delete,
  Edit,
  Close,
} from '@mui/icons-material';
import toast from 'react-hot-toast';

const EventTicketTemplatesManager = ({ eventId, apiRequest, API_BASE_URL }) => {
  const [templates, setTemplates] = useState([]);
  const [availableTemplates, setAvailableTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingAssociation, setEditingAssociation] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [quantity, setQuantity] = useState('');
  const [overridePrice, setOverridePrice] = useState('');
  const [seatSection, setSeatSection] = useState('');
  const [position, setPosition] = useState('0');

  useEffect(() => {
    if (eventId) {
      fetchEventTemplates();
      fetchAvailableTemplates();
    }
  }, [eventId]);

  const fetchEventTemplates = async () => {
    try {
      setLoading(true);
      const response = await apiRequest(
        `${API_BASE_URL}/events/${eventId}/ticket-templates`
      );

      if (response.ok) {
        const data = await response.json();
        setTemplates(data.data);
      }
    } catch (err) {
      console.error('Fetch event templates error:', err);
      toast.error('Failed to load event ticket templates');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableTemplates = async () => {
    try {
      const response = await apiRequest(
        `${API_BASE_URL}/ticket-templates?limit=100`
      );

      if (response.ok) {
        const data = await response.json();
        setAvailableTemplates(data.data);
      }
    } catch (err) {
      console.error('Fetch available templates error:', err);
    }
  };

  const handleOpenDialog = (association = null) => {
    if (association) {
      setEditingAssociation(association);
      setSelectedTemplate(association.template_id);
      setQuantity(association.quantity.toString());
      setOverridePrice(association.override_price ? association.override_price.toString() : '');
      setSeatSection(association.seat_section || '');
      setPosition(association.position?.toString() || '0');
    } else {
      setEditingAssociation(null);
      setSelectedTemplate('');
      setQuantity('');
      setOverridePrice('');
      setSeatSection('');
      setPosition('0');
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingAssociation(null);
  };

  const handleSaveAssociation = async () => {
    try {
      if (!selectedTemplate || !quantity) {
        toast.error('Template and quantity are required');
        return;
      }

      const payload = {
        template_id: selectedTemplate,
        quantity: parseInt(quantity),
        override_price: overridePrice ? parseFloat(overridePrice) : null,
        seat_section: seatSection || null,
        position: parseInt(position) || 0,
      };

      const url = editingAssociation
        ? `${API_BASE_URL}/events/${eventId}/ticket-templates/${selectedTemplate}`
        : `${API_BASE_URL}/events/${eventId}/ticket-templates`;

      const method = editingAssociation ? 'PUT' : 'POST';

      const response = await apiRequest(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success(editingAssociation ? 'Template updated' : 'Template added');
        handleCloseDialog();
        fetchEventTemplates();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to save');
      }
    } catch (err) {
      console.error('Save association error:', err);
      toast.error('Error saving template association');
    }
  };

  const handleDeleteAssociation = async (templateId) => {
    if (!window.confirm('Remove this template from the event?')) return;

    try {
      const response = await apiRequest(
        `${API_BASE_URL}/events/${eventId}/ticket-templates/${templateId}`,
        { method: 'DELETE' }
      );

      if (response.ok) {
        toast.success('Template removed');
        fetchEventTemplates();
      } else {
        toast.error('Failed to remove template');
      }
    } catch (err) {
      console.error('Delete association error:', err);
      toast.error('Error removing template');
    }
  };

  const getTemplateDisplayName = (templateId) => {
    const template = availableTemplates.find(t => t.id === templateId);
    return template ? template.name : 'Unknown Template';
  };

  if (loading && templates.length === 0) {
    return <CircularProgress />;
  }

  return (
    <Card sx={{ mt: 4 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Ticket Templates
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            size="small"
            onClick={() => handleOpenDialog()}
          >
            Add Template
          </Button>
        </Box>

        {templates.length === 0 ? (
          <Typography color="textSecondary" variant="body2">
            No ticket templates added yet. Add templates to define ticket types for this event.
          </Typography>
        ) : (
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Template Name</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Quantity</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Base Price</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Override Price</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Seat Section</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {templates.map(association => (
                  <TableRow key={association.id} hover>
                    <TableCell>{association.name}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={association.quantity}
                        size="small"
                        variant="outlined"
                        color="primary"
                      />
                    </TableCell>
                    <TableCell align="center">
                      {association.currency} {parseFloat(association.base_price).toFixed(2)}
                    </TableCell>
                    <TableCell align="center">
                      {association.override_price
                        ? `${association.currency} ${parseFloat(association.override_price).toFixed(2)}`
                        : '-'}
                    </TableCell>
                    <TableCell>{association.seat_section || '-'}</TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleOpenDialog(association)}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteAssociation(association.template_id)}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>

      {/* Add/Edit Template Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{editingAssociation ? 'Edit Template' : 'Add Template to Event'}</span>
          <IconButton size="small" onClick={handleCloseDialog}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Template</InputLabel>
                <Select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  label="Template"
                  disabled={editingAssociation} // Prevent changing template after creation
                >
                  {availableTemplates.map(template => (
                    <MenuItem key={template.id} value={template.id}>
                      {template.name} ({template.currency} {parseFloat(template.base_price).toFixed(2)})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Quantity"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                inputProps={{ min: '1' }}
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Override Price (Optional)"
                type="number"
                value={overridePrice}
                onChange={(e) => setOverridePrice(e.target.value)}
                inputProps={{ step: '0.01', min: '0' }}
                placeholder="Leave empty to use template price"
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Seat Section (Optional)"
                value={seatSection}
                onChange={(e) => setSeatSection(e.target.value)}
                placeholder="e.g., VIP, Front"
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Position"
                type="number"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                inputProps={{ min: '0' }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog} color="inherit">
            Cancel
          </Button>
          <Button variant="contained" color="primary" onClick={handleSaveAssociation}>
            {editingAssociation ? 'Update' : 'Add'} Template
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default EventTicketTemplatesManager;
