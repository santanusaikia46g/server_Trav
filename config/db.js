// Legacy MongoDB db.js connection file - replaced by server/config/supabase.js
const supabase = require('./supabase');

module.exports = function connectDB() {
  console.log('Database connected via Supabase client module.');
  return supabase;
};
