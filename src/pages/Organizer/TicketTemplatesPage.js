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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Close,
  ArrowBack,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const TicketTemplatesPage = () => {
  const { apiRequest, API_BASE_URL, user } = useAuth();
  const navigate = useNavigate();

  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [page, setPage] = useState(1);
  const limit = 10;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    ticket_type: 'standard',
    ticket_format: 'digital',
    digital_format: 'qr_code',
    base_price: '',
    currency: 'USD',
    service_fee: '',
    is_transferable: false,
    is_refundable: true,
    validity_days: '',
    metadata: '',
  });

  useEffect(() => {
    fetchTemplates();
  }, [page]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await apiRequest(
        `${API_BASE_URL}/ticket-templates?page=${page}&limit=${limit}`
      );

      if (response.ok) {
        const data = await response.json();
        setTemplates(data.data || []);
      } else {
        console.error('API response not ok:', response.status);
        toast.error('Failed to load ticket templates');
        setTemplates([]);
      }
    } catch (err) {
      console.error('Fetch templates error:', err);
      toast.error('Error loading ticket templates');
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (template = null) => {
    if (template) {
      setEditingId(template.id);
      setFormData({
        name: template.name,
        description: template.description || '',
        ticket_type: template.ticket_type,
        ticket_format: template.ticket_format,
        digital_format: template.digital_format,
        base_price: template.base_price.toString(),
        currency: template.currency,
        service_fee: template.service_fee.toString(),
        is_transferable: template.is_transferable,
        is_refundable: template.is_refundable,
        validity_days: template.validity_days ? template.validity_days.toString() : '',
        metadata: template.metadata ? JSON.stringify(template.metadata) : '',
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        description: '',
        ticket_type: 'standard',
        ticket_format: 'digital',
        digital_format: 'qr_code',
        base_price: '',
        currency: 'USD',
        service_fee: '',
        is_transferable: false,
        is_refundable: true,
        validity_days: '',
        metadata: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingId(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSaveTemplate = async () => {
    try {
      // Validation
      if (!formData.name || !formData.base_price) {
        toast.error('Name and base price are required');
        return;
      }

      const payload = {
        ...formData,
        base_price: parseFloat(formData.base_price),
        service_fee: formData.service_fee ? parseFloat(formData.service_fee) : 0,
        validity_days: formData.validity_days ? parseInt(formData.validity_days) : null,
        metadata: formData.metadata ? JSON.parse(formData.metadata) : null,
      };

      const url = editingId
        ? `${API_BASE_URL}/ticket-templates/${editingId}`
        : `${API_BASE_URL}/ticket-templates`;

      const method = editingId ? 'PUT' : 'POST';

      const response = await apiRequest(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success(editingId ? 'Template updated successfully' : 'Template created successfully');
        handleCloseDialog();
        setPage(1);
        fetchTemplates();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to save template');
      }
    } catch (err) {
      console.error('Save template error:', err);
      toast.error('Error saving template');
    }
  };

  const handleDeleteTemplate = async (id) => {
    if (!window.confirm('Are you sure you want to delete this template?')) return;

    try {
      const response = await apiRequest(`${API_BASE_URL}/ticket-templates/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Template deleted successfully');
        fetchTemplates();
      } else {
        toast.error('Failed to delete template');
      }
    } catch (err) {
      console.error('Delete template error:', err);
      toast.error('Error deleting template');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/organizer')}
            sx={{ mb: 2 }}
          >
            Back to Dashboard
          </Button>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            Ticket Templates
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Create and manage ticket templates for your events
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
          size="large"
        >
          Create Template
        </Button>
      </Box>

      {loading && templates.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : templates.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Typography color="textSecondary" sx={{ mb: 2 }}>
              No ticket templates yet. Create one to get started!
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Add />}
              onClick={() => handleOpenDialog()}
            >
              Create Your First Template
            </Button>
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell align="right">Price</TableCell>
                <TableCell>Format</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {templates.map(template => (
                <TableRow key={template.id} hover>
                  <TableCell sx={{ fontWeight: 500 }}>{template.name}</TableCell>
                  <TableCell>
                    <Chip
                      label={template.ticket_type}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right">
                    {template.currency} {parseFloat(template.base_price).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={template.ticket_format}
                      size="small"
                      variant="outlined"
                      color={template.ticket_format === 'digital' ? 'primary' : 'default'}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={template.is_active ? 'Active' : 'Inactive'}
                      size="small"
                      color={template.is_active ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleOpenDialog(template)}
                      title="Edit"
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteTemplate(template.id)}
                      title="Delete"
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{editingId ? 'Edit Ticket Template' : 'Create New Ticket Template'}</span>
          <IconButton size="small" onClick={handleCloseDialog}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Template Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., VIP Pass, Standard Ticket"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                multiline
                rows={3}
                placeholder="Describe this ticket template"
              />
            </Grid>

            <Grid item xs={6}>
              <Select
                fullWidth
                label="Ticket Type"
                name="ticket_type"
                value={formData.ticket_type}
                onChange={handleInputChange}
              >
                <MenuItem value="standard">Standard</MenuItem>
                <MenuItem value="vip">VIP</MenuItem>
                <MenuItem value="premium">Premium</MenuItem>
                <MenuItem value="economy">Economy</MenuItem>
                <MenuItem value="business">Business</MenuItem>
                <MenuItem value="first_class">First Class</MenuItem>
              </Select>
            </Grid>

            <Grid item xs={6}>
              <Select
                fullWidth
                label="Format"
                name="ticket_format"
                value={formData.ticket_format}
                onChange={handleInputChange}
              >
                <MenuItem value="digital">Digital</MenuItem>
                <MenuItem value="physical">Physical</MenuItem>
              </Select>
            </Grid>

            {formData.ticket_format === 'digital' && (
              <Grid item xs={6}>
                <Select
                  fullWidth
                  label="Digital Format"
                  name="digital_format"
                  value={formData.digital_format}
                  onChange={handleInputChange}
                >
                  <MenuItem value="qr_code">QR Code</MenuItem>
                  <MenuItem value="nfc">NFC</MenuItem>
                  <MenuItem value="rfid">RFID</MenuItem>
                  <MenuItem value="barcode">Barcode</MenuItem>
                </Select>
              </Grid>
            )}

            <Grid item xs={formData.ticket_format === 'digital' ? 6 : 6}>
              <TextField
                fullWidth
                label="Base Price"
                name="base_price"
                type="number"
                value={formData.base_price}
                onChange={handleInputChange}
                inputProps={{ step: '0.01', min: '0' }}
              />
            </Grid>

            <Grid item xs={6}>
              <Select
                fullWidth
                label="Currency"
                name="currency"
                value={formData.currency}
                onChange={handleInputChange}
              >
                <MenuItem value="USD">USD</MenuItem>
                <MenuItem value="EUR">EUR</MenuItem>
                <MenuItem value="GBP">GBP</MenuItem>
                <MenuItem value="ZWL">ZWL</MenuItem>
                <MenuItem value="ZAR">ZAR</MenuItem>
              </Select>
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Service Fee"
                name="service_fee"
                type="number"
                value={formData.service_fee}
                onChange={handleInputChange}
                inputProps={{ step: '0.01', min: '0' }}
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Validity Days"
                name="validity_days"
                type="number"
                value={formData.validity_days}
                onChange={handleInputChange}
                placeholder="Optional: Leave empty for unlimited"
                inputProps={{ min: '1' }}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="is_transferable"
                    checked={formData.is_transferable}
                    onChange={handleInputChange}
                  />
                }
                label="Allow ticket transfers"
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="is_refundable"
                    checked={formData.is_refundable}
                    onChange={handleInputChange}
                  />
                }
                label="Allow refunds"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Additional Metadata (JSON)"
                name="metadata"
                value={formData.metadata}
                onChange={handleInputChange}
                multiline
                rows={2}
                placeholder='{"key": "value"}'
                size="small"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog} color="inherit">
            Cancel
          </Button>
          <Button variant="contained" color="primary" onClick={handleSaveTemplate}>
            {editingId ? 'Update' : 'Create'} Template
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TicketTemplatesPage;
