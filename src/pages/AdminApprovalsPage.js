import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Alert,
  CircularProgress,
  Chip,
  Stack,
  Typography,
  ButtonGroup,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import BlockIcon from '@mui/icons-material/Block';

const AdminApprovalsPage = () => {
  const { user, apiRequest, API_BASE_URL } = useAuth();
  const [loading, setLoading] = useState(true);
  const [approvals, setApprovals] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [dialog, setDialog] = useState({
    open: false,
    type: null, // 'approve', 'reject', 'suspend'
    reason: '',
    commission: ''
  });

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchPendingApprovals();
      fetchStats();
    }
  }, [user]);

  const fetchPendingApprovals = async () => {
    try {
      setLoading(true);
      const response = await apiRequest(`${API_BASE_URL}/admin/approvals/pending`);

      if (!response.ok) throw new Error('Failed to fetch approvals');

      const { data } = await response.json();
      setApprovals(data);
    } catch (error) {
      console.error('Error fetching approvals:', error);
      toast.error('Failed to fetch approvals');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await apiRequest(`${API_BASE_URL}/admin/approvals/stats`);

      if (!response.ok) throw new Error('Failed to fetch stats');

      const { data } = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleOpenDialog = (type, user) => {
    setSelectedUser(user);
    setDialog({
      open: true,
      type,
      reason: '',
      commission: ''
    });
  };

  const handleCloseDialog = () => {
    setDialog({
      open: false,
      type: null,
      reason: '',
      commission: ''
    });
    setSelectedUser(null);
  };

  const handleApprove = async () => {
    if (!selectedUser) return;

    try {
      const body = {};
      if (dialog.commission) {
        body.commission_percentage = parseFloat(dialog.commission);
      }

      const response = await apiRequest(
        `${API_BASE_URL}/admin/approvals/${selectedUser.id}/approve`,
        {
          method: 'POST',
          body: JSON.stringify(body)
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to approve');
      }

      toast.success('User approved successfully');
      handleCloseDialog();
      // Optimistically update UI: remove from approvals list and adjust stats
      setApprovals(prev => prev.filter(a => a.id !== selectedUser.id));
      setStats(prev => prev ? { ...prev, pending: Math.max(0, (prev.pending || 0) - 1), approved: (prev.approved || 0) + 1 } : prev);
      // Still refresh from server to ensure consistency
      fetchPendingApprovals();
      fetchStats();
    } catch (error) {
      console.error('Error approving user:', error);
      toast.error(error.message);
    }
  };

  const handleReject = async () => {
    if (!selectedUser || !dialog.reason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    try {
      const response = await apiRequest(
        `${API_BASE_URL}/admin/approvals/${selectedUser.id}/reject`,
        {
          method: 'POST',
          body: JSON.stringify({ reason: dialog.reason })
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to reject');
      }

      toast.success('User rejected successfully');
      handleCloseDialog();
      // Optimistically update UI
      setApprovals(prev => prev.filter(a => a.id !== selectedUser.id));
      setStats(prev => prev ? { ...prev, pending: Math.max(0, (prev.pending || 0) - 1), rejected: (prev.rejected || 0) + 1 } : prev);
      fetchPendingApprovals();
      fetchStats();
    } catch (error) {
      console.error('Error rejecting user:', error);
      toast.error(error.message);
    }
  };

  const handleSuspend = async () => {
    if (!selectedUser || !dialog.reason.trim()) {
      toast.error('Please provide a suspension reason');
      return;
    }

    try {
      const response = await apiRequest(
        `${API_BASE_URL}/admin/approvals/${selectedUser.id}/suspend`,
        {
          method: 'POST',
          body: JSON.stringify({ reason: dialog.reason })
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to suspend');
      }

      toast.success('User suspended successfully');
      handleCloseDialog();
      // Optimistically update UI
      setApprovals(prev => prev.filter(a => a.id !== selectedUser.id));
      setStats(prev => prev ? { ...prev, pending: Math.max(0, (prev.pending || 0) - 1), suspended: (prev.suspended || 0) + 1 } : prev);
      fetchPendingApprovals();
      fetchStats();
    } catch (error) {
      console.error('Error suspending user:', error);
      toast.error(error.message);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'warning',
      'approved': 'success',
      'rejected': 'error',
      'suspended': 'error'
    };
    return colors[status] || 'default';
  };

  const getRoleLabel = (role) => {
    return role === 'organizer' ? 'Organizer' : 'Venue Manager';
  };

  if (user?.role !== 'admin') {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Alert severity="error">
          This page is only accessible to administrators.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Organizer & Venue Manager Approvals
      </Typography>

      {/* Statistics Cards */}
      {stats && (
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Pending
                </Typography>
                <Typography variant="h5">{stats.pending}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Approved
                </Typography>
                <Typography variant="h5">{stats.approved}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Rejected
                </Typography>
                <Typography variant="h5">{stats.rejected}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Suspended
                </Typography>
                <Typography variant="h5">{stats.suspended}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Approvals Table */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : approvals.length === 0 ? (
        <Alert severity="success">No pending approvals</Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell><strong>Name</strong></TableCell>
                <TableCell><strong>Email</strong></TableCell>
                <TableCell><strong>Role</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Applied</strong></TableCell>
                <TableCell align="center"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {approvals.map(approval => (
                <TableRow key={approval.id}>
                  <TableCell>
                    {approval.first_name} {approval.last_name}
                  </TableCell>
                  <TableCell>{approval.email}</TableCell>
                  <TableCell>{getRoleLabel(approval.role)}</TableCell>
                  <TableCell>
                    <Chip
                      label={approval.approval_status.charAt(0).toUpperCase() + approval.approval_status.slice(1)}
                      color={getStatusColor(approval.approval_status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(approval.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        startIcon={<CheckCircleIcon />}
                        onClick={() => handleOpenDialog('approve', approval)}
                      >
                        Approve
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        startIcon={<CancelIcon />}
                        onClick={() => handleOpenDialog('reject', approval)}
                      >
                        Reject
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Approval Dialog */}
      <Dialog open={dialog.open} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialog.type === 'approve' && 'Approve User'}
          {dialog.type === 'reject' && 'Reject User'}
          {dialog.type === 'suspend' && 'Suspend User'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {selectedUser && (
            <>
              <Typography variant="body2" sx={{ mb: 2, color: 'textSecondary' }}>
                {selectedUser.first_name} {selectedUser.last_name} ({selectedUser.email})
              </Typography>

              {dialog.type === 'approve' && (
                <TextField
                  fullWidth
                  label="Commission Percentage (optional)"
                  type="number"
                  inputProps={{ step: '0.1', min: '0', max: '100' }}
                  value={dialog.commission}
                  onChange={(e) => setDialog({ ...dialog, commission: e.target.value })}
                  helperText="Leave blank to use default 5%"
                  sx={{ mb: 2 }}
                />
              )}

              {(dialog.type === 'reject' || dialog.type === 'suspend') && (
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Reason"
                  value={dialog.reason}
                  onChange={(e) => setDialog({ ...dialog, reason: e.target.value })}
                  placeholder="Explain the reason for this action..."
                  required
                />
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          {dialog.type === 'approve' && (
            <Button onClick={handleApprove} variant="contained" color="success">
              Approve
            </Button>
          )}
          {dialog.type === 'reject' && (
            <Button onClick={handleReject} variant="contained" color="error">
              Reject
            </Button>
          )}
          {dialog.type === 'suspend' && (
            <Button onClick={handleSuspend} variant="contained" color="error">
              Suspend
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminApprovalsPage;
