import React, { useState, useRef, useEffect } from 'react';
import { TextField, Box, List, ListItem, ListItemText, Paper, CircularProgress, Typography } from '@mui/material';
import { MapPin, AlertCircle } from 'lucide-react';

const GooglePlacesAutocomplete = ({ 
  value = '', 
  onChange = () => {}, 
  label = 'Address', 
  placeholder = 'Enter an address',
  onAddressSelect = null,
  fullWidth = true,
  error = false,
  helperText = '',
  required = false,
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const autocompleteServiceRef = useRef(null);
  const placeServiceRef = useRef(null);

  useEffect(() => {
    // Initialize Google Places services
    if (window.google) {
      console.log('Google Maps API loaded, initializing services...');
      autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
      placeServiceRef.current = new window.google.maps.places.PlacesService(
        document.createElement('div')
      );
      console.log('Google Places services initialized');
    } else {
      console.warn('Google Maps API not yet available');
    }
  }, []);

  const handleInputChange = async (e) => {
    const inputValue = e.target.value;
    console.log('Input changed:', inputValue);
    
    // Call onChange if it's provided
    if (onChange && typeof onChange === 'function') {
      onChange(inputValue);
    }

    if (inputValue.length < 2) {
      console.log('Input too short, clearing suggestions');
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setLoading(true);

    try {
      if (!window.google) {
        console.error('Google Maps API not loaded');
        setShowSuggestions(true);
        setSuggestions([]);
        setLoading(false);
        return;
      }

      if (!autocompleteServiceRef.current) {
        autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
      }

      const predictions = await new Promise((resolve, reject) => {
        autocompleteServiceRef.current.getPlacePredictions(
          {
            input: inputValue,
            componentRestrictions: { country: 'zw' }, // Zimbabwe
          },
          (predictions, status) => {
            console.log('Google Places Predictions:', { predictions, status, statusEnum: window.google.maps.places.PlacesServiceStatus });
            if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
              console.log('Found predictions:', predictions.length);
              resolve(predictions);
            } else {
              console.log('No predictions or error status:', status);
              resolve([]);
            }
          }
        );
      });

      console.log('Final suggestions to display:', predictions);
      setSuggestions(predictions);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
      setShowSuggestions(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlace = (placeId, description) => {
    onChange(description);
    setShowSuggestions(false);
    setSuggestions([]);

    // Get detailed place information
    if (placeServiceRef.current && onAddressSelect) {
      const request = { placeId };
      placeServiceRef.current.getDetails(request, (place, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
          const addressData = {
            address: description,
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
            placeId: place.place_id,
            components: place.address_components,
          };

          // Extract city, country, state from address components
          const cityComponent = place.address_components.find((c) =>
            c.types.includes('locality')
          );
          const countryComponent = place.address_components.find((c) =>
            c.types.includes('country')
          );
          const stateComponent = place.address_components.find((c) =>
            c.types.includes('administrative_area_level_1')
          );

          addressData.city = cityComponent?.long_name || '';
          addressData.country = countryComponent?.long_name || '';
          addressData.state = stateComponent?.long_name || '';

          onAddressSelect(addressData);
        }
      });
    }
  };

  return (
    <Box sx={{ position: 'relative', width: fullWidth ? '100%' : 'auto' }}>
      <TextField
        ref={inputRef}
        label={label}
        placeholder={placeholder}
        value={value}
        onChange={handleInputChange}
        fullWidth={fullWidth}
        error={error}
        helperText={helperText}
        required={required}
        InputProps={{
          startAdornment: <MapPin size={20} style={{ marginRight: 8, opacity: 0.5 }} />,
          endAdornment: loading && <CircularProgress size={20} />,
        }}
      />

      {showSuggestions && (
        <Paper
          sx={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 1300,
            maxHeight: 400,
            overflow: 'auto',
            mt: 1,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            border: '1px solid #e0e0e0',
            borderRadius: 1,
          }}
        >
          {loading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 3 }}>
              <CircularProgress size={30} />
            </Box>
          ) : suggestions.length > 0 ? (
            <List sx={{ py: 0 }}>
              {suggestions.map((suggestion, index) => {
                console.log('Rendering suggestion:', suggestion);
                const mainText = suggestion.main_text || suggestion.description || 'Unknown location';
                const secondaryText = suggestion.secondary_text || '';
                return (
                <ListItem
                  key={suggestion.place_id || index}
                  button
                  onClick={() =>
                    handleSelectPlace(suggestion.place_id, suggestion.description)
                  }
                  sx={{
                    py: 1.5,
                    px: 2,
                    borderBottom: index < suggestions.length - 1 ? '1px solid #f0f0f0' : 'none',
                    backgroundColor: '#fff',
                    '&:hover': { 
                      bgcolor: '#f9f9f9',
                      cursor: 'pointer',
                    },
                    transition: 'background-color 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                  }}
                >
                  <MapPin size={16} style={{ marginTop: 0, opacity: 0.5, flexShrink: 0 }} />
                  <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', minWidth: 0 }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: 500, 
                        color: '#000',
                        wordBreak: 'break-word',
                        whiteSpace: 'normal',
                      }}
                    >
                      {mainText}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: '#666',
                        marginTop: 0.25,
                        wordBreak: 'break-word',
                        whiteSpace: 'normal',
                      }}
                    >
                      {secondaryText}
                    </Typography>
                  </Box>
                </ListItem>
              );
              })}
            </List>
          ) : (
            <Box sx={{ py: 3, px: 2, textAlign: 'center' }}>
              <AlertCircle size={24} style={{ opacity: 0.5, marginBottom: 8, margin: '0 auto 8px' }} />
              <Typography variant="caption" color="text.secondary">
                No locations found. Try a different search.
              </Typography>
            </Box>
          )}
        </Paper>
      )}
    </Box>
  );
};

export default GooglePlacesAutocomplete;
