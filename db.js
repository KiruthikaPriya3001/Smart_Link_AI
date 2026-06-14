const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smartlink',
      {
        // Skip MongoDB replica-set topology discovery — connect directly.
        // This eliminates the 2-second topology handshake on local/standalone servers.
        directConnection: true,
        // Fail fast if MongoDB is unreachable instead of waiting 30s (default)
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000,
        // Keep the connection alive on idle to avoid reconnect delays on first request
        socketTimeoutMS: 45000,
        // Maintain a warm connection pool
        maxPoolSize: 10,
        minPoolSize: 2,
      }
    );
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
