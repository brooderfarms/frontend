import React, { useState } from 'react';
import { Container, Typography, Card, CardContent, TextField, Button, Divider, Alert } from '@mui/material';
import { useAuth } from '../../context/AuthContext';

const SettingsPage = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [passwords, setPasswords] = useState({ current: '', new: '' });
  const [profileMsg, setProfileMsg] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleProfileChange = e => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setProfileMsg('');
    const res = await updateProfile(profile);
    setProfileMsg(res.success ? 'Profile updated!' : res.error);
    setLoading(false);
  };

  const handlePasswordChange = e => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handlePasswordSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setPasswordMsg('');
    const res = await changePassword(passwords.current, passwords.new);
    setPasswordMsg(res.success ? 'Password changed!' : res.error);
    setLoading(false);
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>Settings</Typography>
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Profile</Typography>
          <form onSubmit={handleProfileSubmit}>
            <TextField
              label="Name"
              name="name"
              value={profile.name}
              onChange={handleProfileChange}
              fullWidth
              sx={{ mb: 2 }}
            />
            <TextField
              label="Email"
              name="email"
              value={profile.email}
              onChange={handleProfileChange}
              fullWidth
              sx={{ mb: 2 }}
              disabled
            />
            <Button type="submit" variant="contained" disabled={loading}>Save Changes</Button>
            {profileMsg && <Alert severity={profileMsg === 'Profile updated!' ? 'success' : 'error'} sx={{ mt: 2 }}>{profileMsg}</Alert>}
          </form>
        </CardContent>
      </Card>
      <Divider sx={{ mb: 4 }} />
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>Change Password</Typography>
          <form onSubmit={handlePasswordSubmit}>
            <TextField
              label="Current Password"
              name="current"
              type="password"
              value={passwords.current}
              onChange={handlePasswordChange}
              fullWidth
              sx={{ mb: 2 }}
            />
            <TextField
              label="New Password"
              name="new"
              type="password"
              value={passwords.new}
              onChange={handlePasswordChange}
              fullWidth
              sx={{ mb: 2 }}
            />
            <Button type="submit" variant="contained" disabled={loading}>Change Password</Button>
            {passwordMsg && <Alert severity={passwordMsg === 'Password changed!' ? 'success' : 'error'} sx={{ mt: 2 }}>{passwordMsg}</Alert>}
          </form>
        </CardContent>
      </Card>
    </Container>
  );
};

export default SettingsPage;
