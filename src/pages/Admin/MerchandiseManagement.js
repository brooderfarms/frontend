import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
} from '@mui/material';
import {
  Edit,
  Delete,
  Add,
  Inventory,
  TrendingUp,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const MerchandiseManagement = () => {
  const navigate = useNavigate();
  const { apiRequest, API_BASE_URL } = useAuth();

  const [merchandise, setMerchandise] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'cards',
    description: '',
    base_price: '',
    min_quantity: '1',
    max_quantity: '1000',
    max_customization_cost: '5',
  });

  useEffect(() => {
    fetchMerchandise();
  }, []);

  const fetchMerchandise = async () => {
    try {
      setLoading(true);
      const response = await apiRequest(`${API_BASE_URL}/merchandise/types`);
      if (response.ok) {
        const data = await response.json();
        setMerchandise(data.data);
      }
    } catch (err) {
      console.error('Fetch merchandise error:', err);
      toast.error('Failed to load merchandise');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (item = null) => {
    if (item) {
      setEditingId(item.id);
      setFormData({
        name: item.name,
        category: item.category,
        description: item.description,
        base_price: item.base_price.toString(),
        min_quantity: item.metadata?.min_quantity || '1',
        max_quantity: item.metadata?.max_quantity || '1000',
        max_customization_cost: item.metadata?.max_customization_cost || '5',
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        category: 'cards',
        description: '',
        base_price: '',
        min_quantity: '1',
        max_quantity: '1000',
        max_customization_cost: '5',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveMerchandise = async () => {
    if (!formData.name || !formData.base_price) {
      toast.error('Name and price are required');
      return;
    }

    try {
      const payload = {
        name: formData.name,
        category: formData.category,
        description: formData.description,
        base_price: parseFloat(formData.base_price),
        metadata: {
          min_quantity: parseInt(formData.min_quantity),
          max_quantity: parseInt(formData.max_quantity),
          max_customization_cost: parseFloat(formData.max_customization_cost),
        },
      };

      const method = editingId ? 'PUT' : 'POST';
      const url = editingId
        ? `${API_BASE_URL}/merchandise/types/${editingId}`
        : `${API_BASE_URL}/merchandise/types`;

      const response = await apiRequest(url, {
        method,
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success(editingId ? 'Merchandise updated' : 'Merchandise created');
        fetchMerchandise();
        handleCloseDialog();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to save');
      }
    } catch (err) {
      console.error('Save merchandise error:', err);
      toast.error('Error saving merchandise');
    }
  };

  const handleDeleteMerchandise = async (id) => {
    if (!window.confirm('Are you sure you want to delete this merchandise?')) return;

    try {
      const response = await apiRequest(
        `${API_BASE_URL}/merchandise/types/${id}`,
        { method: 'DELETE' }
      );

      if (response.ok) {
        toast.success('Merchandise deleted');
        fetchMerchandise();
      } else {
        toast.error('Failed to delete');
      }
    } catch (err) {
      console.error('Delete merchandise error:', err);
      toast.error('Error deleting merchandise');
    }
  };

  if (loading) {
    return (
      <Container sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
            Merchandise Management
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Manage merchandise products and pricing
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<TrendingUp />}
            onClick={() => navigate('/admin/merchandise-sales')}
          >
            View Sales
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
          >
            Add Merchandise
          </Button>
        </Box>
      </Box>

      {merchandise.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Inventory sx={{ fontSize: 64, color: 'textSecondary', mb: 2 }} />
            <Typography color="textSecondary">
              No merchandise products yet. Create your first product!
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Price</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Min/Max Qty</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {merchandise.map(item => (
                <TableRow key={item.id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {item.name}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {item.description}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={item.category} size="small" />
                  </TableCell>
                  <TableCell align="right">
                    ${item.base_price.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {item.metadata?.min_quantity || 1} - {item.metadata?.max_quantity || 1000}
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Edit />}
                      onClick={() => handleOpenDialog(item)}
                      sx={{ mr: 1 }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      startIcon={<Delete />}
                      onClick={() => handleDeleteMerchandise(item.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingId ? 'Edit Merchandise' : 'Add New Merchandise'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Product Name"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  name="category"
                  value={formData.category}
                  label="Category"
                  onChange={handleFormChange}
                >
                  <MenuItem value="cards">Cards/Credentials</MenuItem>
                  <MenuItem value="tags">Tags</MenuItem>
                  <MenuItem value="bands">Wristbands</MenuItem>
                  <MenuItem value="lanyards">Lanyards</MenuItem>
                  <MenuItem value="badges">Badges</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Base Price ($)"
                name="base_price"
                type="number"
                value={formData.base_price}
                onChange={handleFormChange}
                inputProps={{ step: '0.01' }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Max Customization Cost"
                name="max_customization_cost"
                type="number"
                value={formData.max_customization_cost}
                onChange={handleFormChange}
                inputProps={{ step: '0.01' }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Min Quantity"
                name="min_quantity"
                type="number"
                value={formData.min_quantity}
                onChange={handleFormChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Max Quantity"
                name="max_quantity"
                type="number"
                value={formData.max_quantity}
                onChange={handleFormChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveMerchandise} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MerchandiseManagement;
