require('dotenv').config();
const express = require('express');
const cors = require('cors');
const supabase = require('./config/supabase');
const seedDatabase = require('./scripts/seed');

// Route files
const adminRoutes = require('./routes/adminRoutes');
const packageRoutes = require('./routes/packageRoutes');
const destinationRoutes = require('./routes/destinationRoutes');
const inquiryRoutes = require('./routes/inquiryRoutes');

// Auto-seed database if tables are empty
seedDatabase({ autoOnly: true }).catch(err => {
  console.error('Auto-seed check failed:', err.message);
});

const app = express();

// Middlewares
app.use(cors({
  origin: '*', // For development. Can be restricted to specific hosts in production.
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Set up routes
app.use('/api/admin', adminRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/destinations', destinationRoutes);
app.use('/api/inquiry', inquiryRoutes);

// Simple root check
app.get('/', (req, res) => {
  res.send('Travmitra Travel Agency API (Supabase) is running...');
});

// 404 Route handler
app.use((req, res, next) => {
  res.status(404).json({ message: 'Resource not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.stack : {}
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
