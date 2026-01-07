import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  Avatar,
  Tabs,
  Tab,
  Link,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Shop,
  TrendingUp,
  Inventory,
  LocalShipping,
  Payment,
  Refresh,
  AccountBalance,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

const VendorDashboard = () => {
  const { apiRequest, API_BASE_URL, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [vendorStats, setVendorStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [commissions, setCommissions] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [commissionSummary, setCommissionSummary] = useState(null);

  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    cost: '',
    category: 'merchandise',
    stock: '0'
  });

  const [showVendorDialog, setShowVendorDialog] = useState(false);
  const [vendorFormData, setVendorFormData] = useState({
    vendor_name: '',
    contact_phone: '',
    contact_email: ''
  });

  useEffect(() => {
    fetchVendors();
    // Auto-refresh every 30 seconds to catch approval status changes
    const interval = setInterval(fetchVendors, 30000);
    return () => clearInterval(interval);
  }, []);

  // Handle URL hash to set active tab
  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (hash) {
      setActiveTab(hash);
    }
  }, [location.hash]);

  const fetchVendors = async () => {
    try {
      // Fetch all vendors (not just approved) to show pending ones too
      const response = await apiRequest(`${API_BASE_URL}/vendors?limit=100`);
      const data = await response.json();
      
      if (data.success) {
        const userVendors = data.data.vendors.filter(v => v.user_id === user.id);
        setVendors(userVendors);
        if (userVendors.length > 0) {
          setSelectedVendor(userVendors[0]);
          fetchVendorData(userVendors[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching vendors:', error);
      toast.error('Failed to load vendors');
    } finally {
      setLoading(false);
    }
  };

  const fetchVendorData = async (vendorId) => {
    try {
      const productsRes = await apiRequest(`${API_BASE_URL}/vendors/${vendorId}/products?limit=100`);
      const productsData = await productsRes.json();
      if (productsData.success) setProducts(productsData.data.products);

      const ordersRes = await apiRequest(`${API_BASE_URL}/vendors/${vendorId}/orders?limit=100`);
      const ordersData = await ordersRes.json();
      if (ordersData.success) setOrders(ordersData.data.orders);

      const statsRes = await apiRequest(`${API_BASE_URL}/vendors/${vendorId}/sales`);
      const statsData = await statsRes.json();
      if (statsData.success) setVendorStats(statsData.data);

      // Fetch commissions and payouts
      const commissionsRes = await apiRequest(`${API_BASE_URL}/commissions/vendor/${vendorId}`);
      const commissionsData = await commissionsRes.json();
      if (commissionsData.success) {
        const commissionsList = Array.isArray(commissionsData.data?.commissions) 
          ? commissionsData.data.commissions 
          : [];
        setCommissions(commissionsList);
        setCommissionSummary(commissionsData.data?.summary || null);
      } else {
        setCommissions([]);
        setCommissionSummary(null);
      }

      const payoutsRes = await apiRequest(`${API_BASE_URL}/commissions/vendor/${vendorId}/payouts`);
      const payoutsData = await payoutsRes.json();
      if (payoutsData.success) {
        const payoutsList = Array.isArray(payoutsData.data) ? payoutsData.data : (payoutsData.data?.payouts || []);
        setPayouts(payoutsList);
      } else {
        setPayouts([]);
      }
    } catch (error) {
      console.error('Error fetching vendor data:', error);
      toast.error('Failed to load vendor data');
    }
  };

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price) {
      toast.error('Please fill in required fields');
      return;
    }

    try {
      await apiRequest(`${API_BASE_URL}/vendors/${selectedVendor.id}/products`, {
        method: 'POST',
        body: JSON.stringify(newProduct)
      });
      toast.success('Product added successfully');
      setShowProductDialog(false);
      setNewProduct({ name: '', description: '', price: '', cost: '', category: 'merchandise', stock: '0' });
      fetchVendorData(selectedVendor.id);
    } catch (error) {
      toast.error('Failed to add product');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await apiRequest(`${API_BASE_URL}/vendors/${selectedVendor.id}/products/${productId}`, {
          method: 'DELETE'
        });
        toast.success('Product deleted');
        fetchVendorData(selectedVendor.id);
      } catch (error) {
        toast.error('Failed to delete product');
      }
    }
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      await apiRequest(`${API_BASE_URL}/vendors/${selectedVendor.id}/orders/${orderId}`, {
        method: 'PUT',
        body: JSON.stringify({ fulfillment_status: status })
      });
      toast.success('Order updated');
      fetchVendorData(selectedVendor.id);
    } catch (error) {
      toast.error('Failed to update order');
    }
  };

  const handleCreateVendor = async () => {
    if (!vendorFormData.vendor_name) {
      toast.error('Please enter a vendor name');
      return;
    }

    try {
      const response = await apiRequest(`${API_BASE_URL}/vendors`, {
        method: 'POST',
        body: JSON.stringify(vendorFormData) // Don't include event_id for general vendors
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Vendor account created successfully!');
        setShowVendorDialog(false);
        setVendorFormData({ vendor_name: '', contact_phone: '', contact_email: '' });
        fetchVendors();
      } else {
        toast.error(data.message || 'Failed to create vendor account');
      }
    } catch (error) {
      console.error('Error creating vendor:', error);
      toast.error('Failed to create vendor account');
    }
  };

  const StatCard = ({ title, value, icon, color = 'primary' }) => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h4" color={`${color}.main`} sx={{ fontWeight: 'bold' }}>
              {typeof value === 'number' ? value.toLocaleString() : value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
          </Box>
          <Avatar sx={{ bgcolor: `${color}.main` }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (vendors.length === 0) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Shop sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
            Welcome to Vendor Dashboard!
          </Typography>
          <Typography color="textSecondary" sx={{ mb: 4, fontSize: '1rem' }}>
            Create your vendor account to start selling products and services
          </Typography>
          
          <Box sx={{ mb: 4, p: 3, backgroundColor: 'background.default', borderRadius: 2 }}>
            <TextField
              fullWidth
              label="Business/Vendor Name"
              placeholder="e.g., John's Premium Merchandise"
              value={vendorFormData.vendor_name}
              onChange={(e) => setVendorFormData({ ...vendorFormData, vendor_name: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Contact Email"
              placeholder="your@email.com"
              type="email"
              value={vendorFormData.contact_email}
              onChange={(e) => setVendorFormData({ ...vendorFormData, contact_email: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Contact Phone"
              placeholder="+1 (555) 000-0000"
              value={vendorFormData.contact_phone}
              onChange={(e) => setVendorFormData({ ...vendorFormData, contact_phone: e.target.value })}
              sx={{ mb: 3 }}
            />
            <Button 
              variant="contained" 
              size="large"
              fullWidth
              onClick={handleCreateVendor}
            >
              Create Vendor Account
            </Button>
          </Box>

          <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', mb: 2 }}>
            After creating your account, you can register for events to add detailed booth information and pricing.
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            📦 Vendor Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your products, orders, and sales
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Refresh />}
            onClick={() => {
              fetchVendors();
              setLastRefresh(new Date());
            }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setShowProductDialog(true)}
          >
            Add Product
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate('/payment-setup')}
          >
            Payment Setup
          </Button>
        </Box>
      </Box>

      {/* Vendor Selector */}
      {vendors.length > 1 && (
        <Paper sx={{ p: 2, mb: 4, backgroundColor: 'background.default' }}>
          <FormControl sx={{ maxWidth: 350 }}>
            <InputLabel>Select Vendor Account</InputLabel>
            <Select
              value={selectedVendor?.id || ''}
              onChange={(e) => {
                const vendor = vendors.find(v => v.id === e.target.value);
                setSelectedVendor(vendor);
                fetchVendorData(vendor.id);
              }}
              label="Select Vendor Account"
            >
              {vendors.map(vendor => (
                <MenuItem key={vendor.id} value={vendor.id}>
                  {vendor.vendor_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {selectedVendor && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" sx={{ mr: 2 }}>Status:</Typography>
              <Chip
                label={selectedVendor.status || 'pending'}
                color={selectedVendor.status === 'approved' ? 'success' : selectedVendor.status === 'pending' ? 'warning' : 'error'}
                variant="outlined"
                size="small"
              />
            </Box>
          )}
        </Paper>
      )}

      {/* Single Vendor Status */}
      {vendors.length === 1 && selectedVendor && (
        <Paper sx={{ p: 2, mb: 4, backgroundColor: 'background.default' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">
              {selectedVendor.vendor_name}
            </Typography>
            <Chip
              label={selectedVendor.status || 'pending'}
              color={selectedVendor.status === 'approved' ? 'success' : selectedVendor.status === 'pending' ? 'warning' : 'error'}
              variant="outlined"
            />
          </Box>
          {selectedVendor.status === 'pending' && (
            <Typography variant="body2" sx={{ mt: 1, color: 'orange' }}>
              ⏱️ Your vendor account is pending approval. You can still add products and prepare for when your account is approved.
            </Typography>
          )}
          {selectedVendor.status === 'rejected' && (
            <Typography variant="body2" sx={{ mt: 1, color: 'error.main' }}>
              ❌ Your vendor account was rejected. Please contact support for more information.
            </Typography>
          )}
        </Paper>
      )}

      {selectedVendor && (
        <>
          {/* Stats Overview */}
          {vendorStats && (
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Total Revenue"
                  value={`$${vendorStats.totalRevenue?.toFixed(2) || '0.00'}`}
                  icon={<Payment />}
                  color="success"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Total Products"
                  value={products.length}
                  icon={<Inventory />}
                  color="primary"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Total Orders"
                  value={orders.length}
                  icon={<LocalShipping />}
                  color="info"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Pending Orders"
                  value={orders.filter(o => o.fulfillment_status === 'pending').length}
                  icon={<TrendingUp />}
                  color="warning"
                />
              </Grid>
            </Grid>
          )}

          {/* Tabs */}
          <Paper sx={{ mb: 3 }}>
            <Tabs 
              value={activeTab} 
              onChange={(e, newValue) => setActiveTab(newValue)}
              indicatorColor="primary"
              textColor="primary"
            >
              <Tab label="Overview" value="overview" />
              <Tab label="Products" value="products" />
              <Tab label="Orders" value="orders" />
              <Tab label="Commissions & Payouts" value="commissions" />
            </Tabs>
          </Paper>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                      Vendor Information
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Name:</strong> {selectedVendor.vendor_name}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Category:</strong> {selectedVendor.category}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Email:</strong> {selectedVendor.contact_email}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Phone:</strong> {selectedVendor.contact_phone}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Status:</strong>
                      <Chip 
                        label={selectedVendor.approval_status} 
                        size="small"
                        color={selectedVendor.approval_status === 'approved' ? 'success' : 'warning'}
                        sx={{ ml: 1 }}
                      />
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                      Performance
                    </Typography>
                    {vendorStats ? (
                      <>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Total Revenue:</strong> ${vendorStats.totalRevenue?.toFixed(2) || '0.00'}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Total Orders:</strong> {vendorStats.totalOrders || 0}
                        </Typography>
                      </>
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        Loading performance data...
                      </Typography>
                    )}
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Products:</strong> {products.length}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Pending Orders:</strong> {orders.filter(o => o.fulfillment_status === 'pending').length}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* Products Tab */}
          {activeTab === 'products' && (
            <Box>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell><strong>Product Name</strong></TableCell>
                      <TableCell><strong>Price</strong></TableCell>
                      <TableCell><strong>Stock</strong></TableCell>
                      <TableCell><strong>Category</strong></TableCell>
                      <TableCell><strong>Actions</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {products.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} sx={{ textAlign: 'center', py: 4 }}>
                          <Typography color="textSecondary">No products yet. Add your first product!</Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      products.map(product => (
                        <TableRow key={product.id}>
                          <TableCell>{product.name}</TableCell>
                          <TableCell>${Number(product.price).toFixed(2)}</TableCell>
                          <TableCell>{product.stock}</TableCell>
                          <TableCell>{product.category}</TableCell>
                          <TableCell>
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              startIcon={<Delete />}
                              onClick={() => handleDeleteProduct(product.id)}
                            >
                              Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <Box>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell><strong>Order #</strong></TableCell>
                      <TableCell><strong>Amount</strong></TableCell>
                      <TableCell><strong>Status</strong></TableCell>
                      <TableCell><strong>Date</strong></TableCell>
                      <TableCell><strong>Action</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {orders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} sx={{ textAlign: 'center', py: 4 }}>
                          <Typography color="textSecondary">No orders yet</Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      orders.map(order => (
                        <TableRow key={order.id}>
                          <TableCell>{order.order_number}</TableCell>
                          <TableCell>${Number(order.total_amount).toFixed(2)}</TableCell>
                          <TableCell>
                            <Select
                              value={order.fulfillment_status}
                              onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                              size="small"
                            >
                              <MenuItem value="pending">Pending</MenuItem>
                              <MenuItem value="preparing">Preparing</MenuItem>
                              <MenuItem value="ready">Ready</MenuItem>
                              <MenuItem value="completed">Completed</MenuItem>
                            </Select>
                          </TableCell>
                          <TableCell>
                            {new Date(order.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Button size="small">View</Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Commissions & Payouts Tab */}
          {activeTab === 'commissions' && (
            <Box>
              {/* Commission Summary */}
              {commissionSummary && (
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ backgroundColor: 'info.light' }}>
                      <CardContent>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                          Total Sales (30d)
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          ${(commissionSummary.totalSales || 0).toFixed(2)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ backgroundColor: 'warning.light' }}>
                      <CardContent>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                          Commission Charged
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                          ${(commissionSummary.totalCommissions || 0).toFixed(2)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ backgroundColor: 'success.light' }}>
                      <CardContent>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                          Your Net Earnings
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                          ${(commissionSummary.netRevenue || 0).toFixed(2)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card>
                      <CardContent>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                          Commission Rate
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          {commissionSummary.commissionRate || 15}%
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              )}

              {/* Commission Transactions */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                    Commission Transactions
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                          <TableCell><strong>Date</strong></TableCell>
                          <TableCell><strong>Sale Amount</strong></TableCell>
                          <TableCell><strong>Rate</strong></TableCell>
                          <TableCell><strong>Commission</strong></TableCell>
                          <TableCell><strong>Status</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {commissions.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} sx={{ textAlign: 'center', py: 2 }}>
                              <Typography variant="body2" color="textSecondary">
                                No commissions yet
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ) : (
                          commissions.map(commission => (
                            <TableRow key={commission.id}>
                              <TableCell>
                                {new Date(commission.created_at).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                ${Number(commission.sale_amount).toFixed(2)}
                              </TableCell>
                              <TableCell>
                                {commission.commission_rate}%
                              </TableCell>
                              <TableCell>
                                ${Number(commission.commission_amount).toFixed(2)}
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={commission.status}
                                  size="small"
                                  color={commission.status === 'paid' ? 'success' : 'warning'}
                                  variant="outlined"
                                />
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>

              {/* Payouts */}
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                    Payout History
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                          <TableCell><strong>Period</strong></TableCell>
                          <TableCell><strong>Gross Revenue</strong></TableCell>
                          <TableCell><strong>Commission</strong></TableCell>
                          <TableCell><strong>Net Payout</strong></TableCell>
                          <TableCell><strong>Status</strong></TableCell>
                          <TableCell><strong>Date</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {payouts.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} sx={{ textAlign: 'center', py: 2 }}>
                              <Typography variant="body2" color="textSecondary">
                                No payouts yet. Payouts are processed monthly.
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ) : (
                          payouts.map(payout => (
                            <TableRow key={payout.id}>
                              <TableCell>
                                {new Date(payout.period_start).toLocaleDateString()} - {new Date(payout.period_end).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                ${Number(payout.gross_revenue).toFixed(2)}
                              </TableCell>
                              <TableCell>
                                ${Number(payout.total_commissions).toFixed(2)}
                              </TableCell>
                              <TableCell>
                                <strong>${Number(payout.net_revenue).toFixed(2)}</strong>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={payout.status}
                                  size="small"
                                  color={payout.status === 'completed' ? 'success' : 'info'}
                                  variant="outlined"
                                />
                              </TableCell>
                              <TableCell>
                                {payout.created_at ? new Date(payout.created_at).toLocaleDateString() : '-'}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Box>
          )}
        </>
      )}

      {/* Add Product Dialog */}
      <Dialog open={showProductDialog} onClose={() => setShowProductDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Product</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth
            label="Product Name"
            value={newProduct.name}
            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
            sx={{ mb: 2 }}
            required
          />
          <TextField
            fullWidth
            label="Description"
            multiline
            rows={3}
            value={newProduct.description}
            onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Price"
            type="number"
            inputProps={{ step: '0.01' }}
            value={newProduct.price}
            onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
            sx={{ mb: 2 }}
            required
          />
          <TextField
            fullWidth
            label="Cost"
            type="number"
            inputProps={{ step: '0.01' }}
            value={newProduct.cost}
            onChange={(e) => setNewProduct({ ...newProduct, cost: e.target.value })}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={newProduct.category}
              onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
              label="Category"
            >
              <MenuItem value="merchandise">Merchandise</MenuItem>
              <MenuItem value="food">Food</MenuItem>
              <MenuItem value="drink">Drink</MenuItem>
              <MenuItem value="apparel">Apparel</MenuItem>
              <MenuItem value="souvenirs">Souvenirs</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Stock Quantity"
            type="number"
            value={newProduct.stock}
            onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowProductDialog(false)}>Cancel</Button>
          <Button onClick={handleAddProduct} variant="contained">
            Add Product
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default VendorDashboard;
