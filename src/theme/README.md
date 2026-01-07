# TicketPro Theme

A modern, elegant Material-UI theme designed for the TicketPro multi-ticketing platform.

## 🎨 Design System

### Colors
- **Primary**: Modern Blue (`#2563eb`) - Trust, reliability, professionalism
- **Secondary**: Modern Pink (`#ec4899`) - Energy, creativity, warmth
- **Typography**: Inter font family - Clean, modern, highly readable

### Key Features
- ✅ Modern design language with subtle shadows and rounded corners
- ✅ Comprehensive component theming for consistency
- ✅ Responsive breakpoints optimized for all devices
- ✅ Dark mode ready (palette mode can be switched to 'dark')
- ✅ Accessibility compliant color contrasts
- ✅ Custom gradients and visual effects

## 📁 File Structure

```
src/theme/
├── index.js          # Main theme export
├── components.js     # Custom component styles
├── styles.js         # Style utilities and hooks
└── README.md         # This file
```

## 🚀 Usage

### Basic Theme Application

```jsx
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';

function App() {
  return (
    <ThemeProvider theme={theme}>
      {/* Your app components */}
    </ThemeProvider>
  );
}
```

### Using Component Styles

```jsx
import { useComponentStyles } from './theme/styles';

function MyComponent() {
  const styles = useComponentStyles();

  return (
    <Card sx={styles.eventCard}>
      {/* Card content */}
    </Card>
  );
}
```

### Individual Style Functions

```jsx
import { getEventCardStyles, getHeroSectionStyles } from './theme/styles';

function MyComponent() {
  return (
    <Box sx={getEventCardStyles}>
      {/* Content */}
    </Box>
  );
}
```

## 🎯 Component Styles Available

### Layout Components
- `navigation` - Header/navigation styling
- `footer` - Footer component styling
- `heroSection` - Hero/banner section styling

### Content Components
- `eventCard` - Event listing cards
- `ticketCard` - Ticket display cards
- `dashboardCard` - Dashboard metric cards

### Form Components
- `formSection` - Form containers and layouts

### Media Components
- `streamPlayer` - Live stream player styling

## 🎨 Color Palette

### Primary Colors
```js
primary: {
  main: '#2563eb',     // Main blue
  light: '#60a5fa',    // Light blue
  dark: '#1d4ed8',     // Dark blue
  contrastText: '#ffffff'
}
```

### Secondary Colors
```js
secondary: {
  main: '#ec4899',     // Main pink
  light: '#f472b6',    // Light pink
  dark: '#db2777',     // Dark pink
  contrastText: '#ffffff'
}
```

### Status Colors
- Success: Emerald green
- Warning: Amber yellow
- Error: Red
- Info: Blue

## 📱 Responsive Design

The theme includes responsive breakpoints:
- `xs`: 0px and up
- `sm`: 600px and up
- `md`: 900px and up
- `lg`: 1200px and up
- `xl`: 1536px and up

## 🔧 Customization

### Adding New Colors
```js
const customColors = {
  accent: '#8b5cf6', // Purple accent
  neutral: '#64748b', // Slate neutral
};
```

### Extending Component Styles
```js
// In components.js
export const componentStyles = (theme) => ({
  // Existing styles...
  customComponent: {
    backgroundColor: theme.palette.primary.main,
    borderRadius: theme.custom.radius.large,
    // ... custom styles
  },
});
```

### Custom Shadows
The theme includes 25 shadow levels from `shadows[0]` (none) to `shadows[24]` (deepest).

## 🌟 Best Practices

1. **Use Theme Colors**: Always use `theme.palette.primary.main` instead of hardcoded colors
2. **Consistent Spacing**: Use `theme.spacing()` for margins and padding
3. **Component Styles**: Leverage the predefined component styles for consistency
4. **Responsive**: Use theme breakpoints for responsive design
5. **Typography**: Use theme typography variants for consistent text styling

## 🔄 Dark Mode Support

The theme is designed to support dark mode. To enable:

```jsx
const darkTheme = createTheme({
  ...theme,
  palette: {
    ...theme.palette,
    mode: 'dark',
  },
});
```

## 📚 Resources

- [Material-UI Theme Customization](https://mui.com/material-ui/customization/theming/)
- [Inter Font Family](https://fonts.google.com/specimen/Inter)
- [Color Contrast Checker](https://webaim.org/resources/contrastchecker/)

---

**TicketPro Theme v1.0** - Modern, accessible, and beautiful design system for event ticketing.
