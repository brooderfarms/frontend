import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardMedia,
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Chip,
  CircularProgress,
  Rating,
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
} from '@mui/material';
import { Search, ShoppingCart } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast';

const VendorBrowser = () => {
  const { apiRequest, API_BASE_URL, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [vendorProducts, setVendorProducts] = useState([]);
  const [showProducts, setShowProducts] = useState(false);
  const { addProductToCart, cartItems } = useCart();

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const url = new URL(`${API_BASE_URL}/vendors`);
      url.searchParams.append('status', 'approved');
      url.searchParams.append('limit', '100');

      const response = await apiRequest(url.toString());
      const data = await response.json();

      if (data.success) {
        setVendors(data.data.vendors);
      }
    } catch (error) {
      console.error('Error fetching vendors:', error);
      toast.error('Failed to load vendors');
    } finally {
      setLoading(false);
    }
  };

  const fetchVendorProducts = async (vendorId) => {
    try {
      const response = await apiRequest(
        `${API_BASE_URL}/vendors/${vendorId}/products?limit=100`
      );
      const data = await response.json();

      if (data.success) {
        setVendorProducts(data.data.products);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    }
  };

  const handleVendorClick = (vendor) => {
    setSelectedVendor(vendor);
    fetchVendorProducts(vendor.id);
    setShowProducts(true);
  };

  const handleAddToCart = (product) => {
    if (!isAuthenticated()) {
      navigate('/login', { state: { from: { pathname: location.pathname } } });
      return;
    }

    addProductToCart(product, 1);
  };

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = vendor.vendor_name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || vendor.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        🏪 Event Vendors
      </Typography>

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search vendors..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          variant="outlined"
          size="small"
          sx={{ minWidth: 250 }}
          InputProps={{
            startAdornment: <Search sx={{ mr: 1, color: 'action.active' }} />
          }}
        />
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Category</InputLabel>
          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            label="Category"
          >
            <MenuItem value="">All Categories</MenuItem>
            <MenuItem value="food">Food & Beverages</MenuItem>
            <MenuItem value="merchandise">Merchandise</MenuItem>
            <MenuItem value="crafts">Crafts & Handmade</MenuItem>
            <MenuItem value="technology">Technology</MenuItem>
            <MenuItem value="services">Services</MenuItem>
            <MenuItem value="health">Health & Wellness</MenuItem>
            <MenuItem value="other">Other</MenuItem>
          </Select>
        </FormControl>
        <Box sx={{ flex: 1 }} />
        {cartItems.length > 0 && (
          <Chip
            icon={<ShoppingCart />}
            label={`Cart (${cartItems.length})`}
            color="primary"
            variant="outlined"
          />
        )}
      </Box>

      {/* Vendors Grid */}
      {filteredVendors.length > 0 ? (
        <Grid container spacing={3}>
          {filteredVendors.map(vendor => (
            <Grid item xs={12} sm={6} md={4} key={vendor.id}>
              <Card
                sx={{
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  '&:hover': {
                    boxShadow: 4,
                    transform: 'translateY(-4px)'
                  }
                }}
                onClick={() => handleVendorClick(vendor)}
              >
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                    {vendor.vendor_name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Rating value={parseFloat(vendor.rating) || 0} readOnly size="small" />
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      ({vendor.review_count || 0})
                    </Typography>
                  </Box>
                  <Typography color="textSecondary" sx={{ mb: 2, minHeight: 40 }}>
                    {vendor.description}
                  </Typography>
                  <Chip
                    label={vendor.category}
                    size="small"
                    sx={{ mb: 2 }}
                    color="primary"
                    variant="outlined"
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="textSecondary">
                      Booth: {vendor.booth_location || 'TBA'}
                    </Typography>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleVendorClick(vendor);
                      }}
                    >
                      Browse
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="textSecondary">
            No vendors found matching your criteria
          </Typography>
        </Box>
      )}

      {/* Products Dialog */}
      <Dialog
        open={showProducts}
        onClose={() => setShowProducts(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedVendor?.vendor_name} - Products
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {vendorProducts.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell>Product</TableCell>
                    <TableCell align="right">Price</TableCell>
                    <TableCell align="center">Stock</TableCell>
                    <TableCell align="center">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {vendorProducts.map(product => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                            {product.name}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {product.description}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="h6">
                          ${product.price}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={product.stock > 0 ? `${product.stock}` : 'Out'}
                          color={product.stock > 0 ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          size="small"
                          variant="contained"
                          disabled={product.stock === 0}
                          onClick={() => {
                            handleAddToCart(product);
                          }}
                        >
                          Add
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography>No products available</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowProducts(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default VendorBrowser;
