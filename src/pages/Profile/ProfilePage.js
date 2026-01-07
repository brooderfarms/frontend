import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  TextField,
  Grid,
  Avatar,
  Chip,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  LocationOn,
  Edit,
  Save,
  Cancel,
  Lock,
  Security,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import GooglePlacesAutocomplete from '../../components/Common/GooglePlacesAutocomplete';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';

const schema = yup.object({
  first_name: yup.string().required('First name is required').min(2, 'First name must be at least 2 characters'),
  last_name: yup.string().required('Last name is required').min(2, 'Last name must be at least 2 characters'),
  phone: yup.string().matches(/^(\+263|0)[7-8][0-9]{8}$/, 'Please enter a valid Zimbabwean phone number'),
  address: yup.string().max(500, 'Address must be less than 500 characters'),
  city: yup.string().max(100, 'City must be less than 100 characters'),
  state: yup.string().max(100, 'State must be less than 100 characters'),
  country: yup.string().max(100, 'Country must be less than 100 characters'),
  postal_code: yup.string().max(20, 'Postal code must be less than 20 characters'),
});

const ProfilePage = () => {
  const { user, updateProfile, changePassword, apiRequest, API_BASE_URL } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordDialog, setPasswordDialog] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    if (user) {
      reset({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        country: user.country || 'Zimbabwe',
        postal_code: user.postal_code || '',
      });
    }
  }, [user, reset]);

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      const result = await updateProfile(data);
      if (result.success) {
        setEditing(false);
        toast.success('Profile updated successfully!');
      } else {
        toast.error(result.error || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Update profile error:', err);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.new_password.length < 8) {
      toast.error('New password must be at least 8 characters long');
      return;
    }

    try {
      const result = await changePassword(passwordData.current_password, passwordData.new_password);
      if (result.success) {
        setPasswordDialog(false);
        setPasswordData({
          current_password: '',
          new_password: '',
          confirm_password: '',
        });
        toast.success('Password changed successfully!');
      }
    } catch (err) {
      toast.error('Failed to change password');
    }
  };

  const getRoleColor = (role) => {
    const colors = {
      customer: 'primary',
      organizer: 'secondary',
      venue_manager: 'success',
      admin: 'error',
    };
    return colors[role] || 'default';
  };

  const getRoleDisplay = (role) => {
    const displays = {
      customer: 'Customer',
      organizer: 'Event Organizer',
      venue_manager: 'Venue Manager',
      admin: 'Administrator',
    };
    return displays[role] || role;
  };

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography>Loading profile...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          My Profile
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your account information and preferences
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Profile Summary */}
        <Grid item xs={12} md={4}>
          <Card sx={{ textAlign: 'center', mb: 3 }}>
            <CardContent>
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  mx: 'auto',
                  mb: 2,
                  bgcolor: 'primary.main',
                  fontSize: '2rem',
                }}
              >
                {user.first_name?.charAt(0)?.toUpperCase()}
                {user.last_name?.charAt(0)?.toUpperCase()}
              </Avatar>

              <Typography variant="h5" gutterBottom>
                {user.first_name} {user.last_name}
              </Typography>

              <Chip
                label={getRoleDisplay(user.role)}
                color={getRoleColor(user.role)}
                sx={{ mb: 2 }}
              />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Email sx={{ mr: 1, fontSize: 18 }} />
                  <Typography variant="body2">{user.email}</Typography>
                </Box>

                {user.phone && (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Phone sx={{ mr: 1, fontSize: 18 }} />
                    <Typography variant="body2">{user.phone}</Typography>
                  </Box>
                )}

                <Typography variant="body2" color="text.secondary">
                  Member since {new Date(user.created_at).toLocaleDateString()}
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<Lock />}
                  onClick={() => setPasswordDialog(true)}
                  fullWidth
                >
                  Change Password
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Security />}
                  fullWidth
                  disabled
                >
                  Security Settings
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Profile Details */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  Personal Information
                </Typography>
                <Button
                  variant={editing ? 'outlined' : 'contained'}
                  startIcon={editing ? <Cancel /> : <Edit />}
                  onClick={() => {
                    if (editing) {
                      reset();
                    }
                    setEditing(!editing);
                  }}
                >
                  {editing ? 'Cancel' : 'Edit Profile'}
                </Button>
              </Box>

              <form onSubmit={handleSubmit(onSubmit)}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="First Name"
                      {...register('first_name')}
                      error={!!errors.first_name}
                      helperText={errors.first_name?.message}
                      disabled={!editing}
                      required
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      {...register('last_name')}
                      error={!!errors.last_name}
                      helperText={errors.last_name?.message}
                      disabled={!editing}
                      required
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      {...register('phone')}
                      error={!!errors.phone}
                      helperText={errors.phone?.message}
                      disabled={!editing}
                      placeholder="+263 77 123 4567"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Country"
                      {...register('country')}
                      error={!!errors.country}
                      helperText={errors.country?.message}
                      disabled={!editing}
                      defaultValue="Zimbabwe"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    {editing ? (
                      <GooglePlacesAutocomplete
                        value={watch('address')}
                        onChange={(value) => setValue('address', value)}
                        label="Address"
                        placeholder="Search for your address"
                        error={!!errors.address}
                        helperText={errors.address?.message}
                        onAddressSelect={(addressData) => {
                          setValue('address', addressData.address);
                          setValue('city', addressData.city);
                          setValue('state', addressData.state);
                          setValue('country', addressData.country);
                        }}
                      />
                    ) : (
                      <TextField
                        fullWidth
                        label="Address"
                        multiline
                        rows={2}
                        {...register('address')}
                        error={!!errors.address}
                        helperText={errors.address?.message}
                        disabled
                      />
                    )}
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="City"
                      {...register('city')}
                      error={!!errors.city}
                      helperText={errors.city?.message}
                      disabled={!editing}
                    />
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="State/Province"
                      {...register('state')}
                      error={!!errors.state}
                      helperText={errors.state?.message}
                      disabled={!editing}
                    />
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Postal Code"
                      {...register('postal_code')}
                      error={!!errors.postal_code}
                      helperText={errors.postal_code?.message}
                      disabled={!editing}
                    />
                  </Grid>

                  {editing && (
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
                        <Button
                          type="button"
                          variant="outlined"
                          onClick={() => {
                            setEditing(false);
                            reset();
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          variant="contained"
                          disabled={loading}
                        >
                          {loading ? 'Saving...' : 'Save Changes'}
                        </Button>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </form>

              {/* Account Status */}
              <Divider sx={{ my: 3 }} />
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Account Status
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" sx={{ mr: 1 }}>
                      Email Verification:
                    </Typography>
                    <Chip
                      label={user.email_verified ? 'Verified' : 'Pending'}
                      size="small"
                      color={user.email_verified ? 'success' : 'warning'}
                    />
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" sx={{ mr: 1 }}>
                      Phone Verification:
                    </Typography>
                    <Chip
                      label={user.phone_verified ? 'Verified' : 'Not Verified'}
                      size="small"
                      color={user.phone_verified ? 'success' : 'default'}
                    />
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" sx={{ mr: 1 }}>
                      Account Status:
                    </Typography>
                    <Chip
                      label={user.is_active ? 'Active' : 'Inactive'}
                      size="small"
                      color={user.is_active ? 'success' : 'error'}
                    />
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" sx={{ mr: 1 }}>
                      Last Login:
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {user.last_login_at ? new Date(user.last_login_at).toLocaleDateString() : 'Never'}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Change Password Dialog */}
      <Dialog open={passwordDialog} onClose={() => setPasswordDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Current Password"
              type="password"
              value={passwordData.current_password}
              onChange={(e) => setPasswordData(prev => ({ ...prev, current_password: e.target.value }))}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="New Password"
              type="password"
              value={passwordData.new_password}
              onChange={(e) => setPasswordData(prev => ({ ...prev, new_password: e.target.value }))}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Confirm New Password"
              type="password"
              value={passwordData.confirm_password}
              onChange={(e) => setPasswordData(prev => ({ ...prev, confirm_password: e.target.value }))}
              sx={{ mb: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialog(false)}>Cancel</Button>
          <Button onClick={handlePasswordChange} variant="contained">
            Change Password
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProfilePage;
