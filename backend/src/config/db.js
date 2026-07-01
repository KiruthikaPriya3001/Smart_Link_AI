const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smartlink';

  // directConnection is only valid for local standalone servers.
  // Atlas SRV URIs (mongodb+srv://) use a replica set and must NOT use directConnection.
  const isAtlasSRV = uri.startsWith('mongodb+srv://');

  const options = {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
    minPoolSize: 2,
  };

  // Only set directConnection for local non-SRV connections
  if (!isAtlasSRV) {
    options.directConnection = true;
  }

  try {
    const conn = await mongoose.connect(uri, options);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;

