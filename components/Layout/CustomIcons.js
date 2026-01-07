import React from 'react';
import {
  Calendar,
  MapPin,
  BarChart3,
  Ticket,
  Plus,
  ShoppingCart,
  User,
} from 'lucide-react';

export const EventsIcon = ({ fontSize = 'small', ...props }) => (
  <Calendar size={24} {...props} />
);

export const VenuesIcon = ({ fontSize = 'small', ...props }) => (
  <MapPin size={24} {...props} />
);

export const DashboardIcon = ({ fontSize = 'small', ...props }) => (
  <BarChart3 size={24} {...props} />
);

export const TicketsIcon = ({ fontSize = 'small', ...props }) => (
  <Ticket size={24} {...props} />
);

export const CreateIcon = ({ fontSize = 'small', ...props }) => (
  <Plus size={24} {...props} />
);

export const CartIcon = ({ fontSize = 'small', ...props }) => (
  <ShoppingCart size={24} {...props} />
);

export const ProfileIcon = ({ fontSize = 'small', ...props }) => (
  <User size={24} {...props} />
);
