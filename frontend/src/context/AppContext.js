import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [bookings, setBookings] = useState([]);
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [socket, setSocket] = useState(null);
  const [currency, setCurrency] = useState('PHP'); // 'PHP' or 'USD'
  const [toasts, setToasts] = useState([]);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  const addToast = (type, message, timeout = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, type, message }]);
    if (timeout > 0) setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), timeout);
  };

  const removeToast = (id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  };

  const formatCurrency = (value) => {
    if (value === null || value === undefined) return 'N/A';
    const num = Number(value);
    if (Number.isNaN(num)) return value;
    if (currency === 'PHP') return num.toLocaleString('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 0 });
    return num.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  };

  const login = async (username, password) => {
    const res = await axios.post('/api/login', { username, password });
    setUser(res.data.username);
    setToken(res.data.token);
    // persist token and set default header
    try { localStorage.setItem('planna_token', res.data.token); } catch (e) {}
    axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
    addToast('success', `Welcome ${res.data.username}`);
    return res.data;
  };

  const logout = async () => {
    try {
      await axios.post('/api/logout', {}, { headers: { Authorization: `Bearer ${token}` } });
    } catch (e) {
      // ignore
    }
    setUser(null);
    setToken(null);
    try { localStorage.removeItem('planna_token'); } catch (e) {}
    delete axios.defaults.headers.common['Authorization'];
    addToast('success', 'Logged out');
  };

  // Initialize token from localStorage if present
  useEffect(() => {
    try {
      const t = localStorage.getItem('planna_token');
      if (t) {
        setToken(t);
        axios.defaults.headers.common['Authorization'] = `Bearer ${t}`;
        // optionally set a placeholder user
        const s = sessionsFallback();
        if (s) setUser(s);
      }
    } catch (e) {}
  }, []);

  // sessionsFallback just returns null in this stub; kept for future extension
  const sessionsFallback = () => null;

  const fetchBookings = async (q = '') => {
    setLoading(true);
    try {
      const res = await axios.get('/api/bookings', { params: q ? { q } : {} });
      setBookings(res.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch bookings');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await axios.get('/api/analytics');
      setAnalytics(res.data.value || res.data);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    }
  };

  const createBooking = async (bookingData) => {
    try {
      const res = await axios.post('/api/bookings', bookingData);
      setBookings([res.data, ...bookings]);
      await fetchAnalytics();
      return res.data;
    } catch (err) {
      setError('Failed to create booking');
      throw err;
    }
  };

  useEffect(() => {
    fetchBookings();
    fetchAnalytics();

    // Initialize Socket.IO connection
    const newSocket = io('http://localhost:3002', {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    newSocket.on('connect', () => {
      console.log('Connected to backend via Socket.IO');
    });

    newSocket.on('analytics:update', (analyticsData) => {
      console.log('Analytics updated:', analyticsData);
      setAnalytics((prev) => [analyticsData, ...prev]);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from backend');
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <AppContext.Provider
      value={{
        bookings,
        analytics,
        loading,
        error,
        fetchBookings,
        fetchAnalytics,
        createBooking,
        socket,
        currency,
        setCurrency,
        toasts,
        addToast,
        removeToast,
        formatCurrency,
        user,
        login,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
