import { useTheme } from '@mui/material/styles';
import componentStyles from './components';

// Custom hook to get component styles
export const useComponentStyles = () => {
  const theme = useTheme();
  return componentStyles(theme);
};

// Utility function to get styles for a specific component
export const getComponentStyle = (componentName) => {
  return (theme) => componentStyles(theme)[componentName] || {};
};

// Export individual style getters for convenience
export const getEventCardStyles = (theme) => componentStyles(theme).eventCard;
export const getHeroSectionStyles = (theme) => componentStyles(theme).heroSection;
export const getTicketCardStyles = (theme) => componentStyles(theme).ticketCard;
export const getNavigationStyles = (theme) => componentStyles(theme).navigation;
export const getFooterStyles = (theme) => componentStyles(theme).footer;
export const getFormSectionStyles = (theme) => componentStyles(theme).formSection;
export const getDashboardCardStyles = (theme) => componentStyles(theme).dashboardCard;
export const getStreamPlayerStyles = (theme) => componentStyles(theme).streamPlayer;
