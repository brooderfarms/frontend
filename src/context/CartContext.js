import React, { createContext, useState, useContext, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [cartCount, setCartCount] = useState(0);

  // Generate user-specific localStorage key
  const getCartKey = () => {
    if (!user || !user.id) {
      return null;
    }
    return `cart_${user.id}`;
  };

  // Load cart from localStorage on mount or when user changes
  useEffect(() => {
    const cartKey = getCartKey();
    
    if (!cartKey) {
      // No user logged in, clear cart
      setCartItems([]);
      return;
    }

    const savedCart = localStorage.getItem(cartKey);
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCartItems(parsedCart);
      } catch (error) {
        console.error('Failed to parse saved cart:', error);
        localStorage.removeItem(cartKey);
        setCartItems([]);
      }
    } else {
      setCartItems([]);
    }
  }, [user?.id]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    const cartKey = getCartKey();
    
    if (!cartKey) {
      // No user logged in, don't save
      return;
    }

    if (cartItems.length === 0) {
      localStorage.removeItem(cartKey);
    } else {
      localStorage.setItem(cartKey, JSON.stringify(cartItems));
    }
    
    calculateTotals();
  }, [cartItems, user?.id]);

  const calculateTotals = () => {
    const total = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const count = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    setCartTotal(total);
    setCartCount(count);
  };

  const addToCart = (event, ticketDetails) => {
    // Ensure user is logged in
    if (!user || !user.id) {
      toast.error('Please login to add items to cart');
      return;
    }

    const { ticket_type, ticket_format, quantity, seat_numbers, selected_seats, session_id } = ticketDetails;

    // Calculate pricing - use session pricing if available
    let basePrice = ticketDetails.session_price || event.base_price || 0;
    if (ticket_type === 'vip') basePrice *= 2;
    else if (ticket_type === 'premium') basePrice *= 1.5;
    else if (ticket_type === 'business') basePrice *= 1.5;
    else if (ticket_type === 'first_class') basePrice *= 2;

    const serviceFee = basePrice * 0.1; // 10% service fee
    const totalPrice = (basePrice + serviceFee) * quantity;

    const cartItem = {
      id: `${event.id}-${Date.now()}-${Math.random()}`, // Unique ID for each cart item
      eventId: event.id,
      eventTitle: event.title,
      eventDate: event.start_date,
      venueName: event.venue_name,
      ticketType: ticket_type,
      ticketFormat: ticket_format,
      quantity,
      seatNumbers: seat_numbers || selected_seats || [],
      basePrice,
      serviceFee,
      totalPrice,
      image: event.event_image_url,
      sessionId: session_id || null, // Add session ID if selecting a specific session
    };

    setCartItems(prev => [...prev, cartItem]);
    toast.success(`${quantity} ticket${quantity > 1 ? 's' : ''} added to cart`);
  };

  const removeFromCart = (itemId) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
    toast.success('Item removed from cart');
  };

  const updateCartItem = (itemId, updates) => {
    setCartItems(prev =>
      prev.map(item =>
        item.id === itemId
          ? { ...item, ...updates }
          : item
      )
    );
  };

  const clearCart = () => {
    const cartKey = getCartKey();
    setCartItems([]);
    if (cartKey) {
      localStorage.removeItem(cartKey);
    }
  };

  const isInCart = (eventId) => {
    return cartItems.some(item => item.eventId === eventId);
  };

  const getCartItemCount = (eventId) => {
    const item = cartItems.find(item => item.eventId === eventId);
    return item ? item.quantity : 0;
  };

  const validateCart = () => {
    const errors = [];

    cartItems.forEach(item => {
      // Check if event is still available
      // Check if seats are still available
      // Check if quantities are valid
      if (item.quantity < 1) {
        errors.push(`${item.eventTitle}: Invalid quantity`);
      }

      // Check event date
      const eventDate = new Date(item.eventDate);
      const now = new Date();
      if (eventDate <= now) {
        errors.push(`${item.eventTitle}: Event has already started or passed`);
      }
    });

    return errors;
  };

  const value = {
    cartItems,
    cartTotal,
    cartCount,
    addToCart,
    // Add product-specific cart helper for vendors/merchandise
    addProductToCart: (product, quantity = 1) => {
      if (!user || !user.id) {
        toast.error('Please login to add items to cart');
        return;
      }

      const totalPrice = (product.price || 0) * quantity;

      const cartItem = {
        id: `${product.id}-${Date.now()}-${Math.random()}`,
        productId: product.id,
        vendorId: product.vendor_id || product.vendorId || null,
        name: product.name || product.title || 'Product',
        quantity,
        basePrice: product.price || 0,
        totalPrice,
        image: product.image || product.image_url || null,
        meta: product,
      };

      setCartItems(prev => [...prev, cartItem]);
      toast.success(`${cartItem.name} added to cart`);
    },
    removeFromCart,
    updateCartItem,
    clearCart,
    isInCart,
    getCartItemCount,
    validateCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
