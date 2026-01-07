import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Chip,
  Box,
  CircularProgress,
} from '@mui/material';
import { Favorite, FavoriteBorder, Event } from '@mui/icons-material';

const WishlistPage = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Replace with real API call
    setTimeout(() => {
      setWishlist([
        {
          id: 1,
          title: 'Summer Music Festival',
          date: '2026-07-15',
          location: 'Harare Stadium',
          image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80',
          category: 'music',
          isFavorite: true,
        },
        {
          id: 2,
          title: 'Champions League Final',
          date: '2026-05-28',
          location: 'National Sports Arena',
          image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
          category: 'sports',
          isFavorite: true,
        },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleToggleFavorite = (id) => {
    setWishlist((prev) =>
      prev.map((event) =>
        event.id === id ? { ...event, isFavorite: !event.isFavorite } : event
      )
    );
  };

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <Event color="primary" fontSize="large" />
        <Typography variant="h4" fontWeight={700}>
          Wishlist
        </Typography>
      </Box>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : wishlist.length === 0 ? (
        <Typography variant="h6" color="text.secondary" align="center" sx={{ py: 8 }}>
          No events in your wishlist yet.
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {wishlist.map((event) => (
            <Grid item xs={12} sm={6} key={event.id}>
              <Card sx={{ position: 'relative', height: '100%' }}>
                {event.image && (
                  <CardMedia
                    component="img"
                    height="180"
                    image={event.image}
                    alt={event.title}
                  />
                )}
                <CardContent>
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    {event.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(event.date).toLocaleDateString()} &bull; {event.location}
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Chip label={event.category} variant="outlined" />
                  </Box>
                </CardContent>
                <IconButton
                  sx={{ position: 'absolute', top: 12, right: 12 }}
                  color={event.isFavorite ? 'error' : 'default'}
                  onClick={() => handleToggleFavorite(event.id)}
                >
                  {event.isFavorite ? <Favorite /> : <FavoriteBorder />}
                </IconButton>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default WishlistPage;
