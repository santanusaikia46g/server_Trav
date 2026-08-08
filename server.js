require('dotenv').config();
const express = require('express');
const cors = require('cors');
const supabase = require('./config/supabase');
// Route files
const adminRoutes = require('./routes/adminRoutes');
const packageRoutes = require('./routes/packageRoutes');
const destinationRoutes = require('./routes/destinationRoutes');
const inquiryRoutes = require('./routes/inquiryRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const activityRoutes = require('./routes/activityRoutes');

const app = express();

// Middlewares
const allowedOrigins = process.env.CLIENT_URL 
  ? [process.env.CLIENT_URL, 'https://client-trav.vercel.app', 'http://localhost:5173', 'http://localhost:3000']
  : '*';

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Set up routes
app.use('/api/admin', adminRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/destinations', destinationRoutes);
app.use('/api/inquiry', inquiryRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/activity', activityRoutes);

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

const seedDefaultAdmin = async () => {
  try {
    const bcrypt = require('bcryptjs');
    const { data: existing } = await supabase.from('admins').select('*').eq('username', 'admin').maybeSingle();
    if (!existing) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      await supabase.from('admins').insert([{ username: 'admin', password: hashedPassword }]);
      console.log('Default admin user initialized (username: admin, password: admin123)');
    }
  } catch (err) {
    console.error('Error seeding default admin:', err.message);
  }
};

const rawPort = process.env.PORT;
const parsedPort = parseInt(rawPort, 10);
const PORT = (!isNaN(parsedPort) && parsedPort > 0) ? parsedPort : 5000;

app.listen(PORT, async () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  await seedDefaultAdmin();
});

