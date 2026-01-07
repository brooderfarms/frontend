import React from 'react';
import { Autocomplete, TextField, Box, Typography } from '@mui/material';
import { Controller } from 'react-hook-form';

/**
 * Reusable Autocomplete component that displays human-readable labels but stores UUIDs
 */
const AutocompleteField = ({
  name,
  control,
  options = [],
  label,
  placeholder,
  getOptionLabel,
  renderOption,
  renderInput,
  error,
  helperText,
  required = false,
  loading = false,
  ...autocompleteProps
}) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value, ...field } }) => (
        <Autocomplete
          {...field}
          {...autocompleteProps}
          value={Array.isArray(options) ? (options.find(option => option.id === value) || null) : null}
          onChange={(event, newValue) => {
            onChange(newValue ? newValue.id : '');
          }}
          options={Array.isArray(options) ? options : []}
          getOptionLabel={getOptionLabel || ((option) => option.name || option.label || '')}
          loading={loading}
          renderInput={(params) => (
            <TextField
              {...params}
              label={label}
              placeholder={placeholder}
              error={!!error}
              helperText={error?.message || helperText}
              required={required}
            />
          )}
          renderOption={renderOption || ((props, option) => (
            <li {...props}>
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  {option.name || option.label || option.title || 'Unknown'}
                </Typography>
                {option.description && (
                  <Typography variant="body2" color="text.secondary">
                    {option.description}
                  </Typography>
                )}
              </Box>
            </li>
          ))}
        />
      )}
    />
  );
};

export default AutocompleteField;
