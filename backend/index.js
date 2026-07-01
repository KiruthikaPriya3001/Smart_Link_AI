require('dotenv').config();
const app = require('./src/app');

const PORT = process.env.PORT || 5000;

// Start HTTP server immediately — don't wait for DB connection.
// This makes the port available fast; DB connects in the background.
const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Connect to MongoDB after server is already listening
app.connectDB().then(() => {
  console.log('Database ready. All systems operational.');
}).catch((err) => {
  console.error('Database connection failed:', err.message);
  server.close(() => process.exit(1));
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});
