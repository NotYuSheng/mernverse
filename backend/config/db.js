const mongoose = require('mongoose');

const connectDB = async (retries = 5, delay = 5000) => {
  const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/mernverse';

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const conn = await mongoose.connect(mongoURI);
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      return;
    } catch (error) {
      console.error(`MongoDB connection failed (Attempt ${attempt}/${retries}): ${error.message}`);

      if (attempt < retries) {
        console.log(`Retrying in ${delay / 1000} seconds...`);
        await new Promise(res => setTimeout(res, delay)); // wait before retry
      } else {
        console.error('Max retries reached. Could not connect to MongoDB.');
        process.exit(1); // Exit after all retries fail
      }
    }
  }
};

module.exports = connectDB;
