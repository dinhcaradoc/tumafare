// db.js
const mongoose = require('mongoose');

const connectDb = async () => {
  const dbUri = process.env.MONGO_URI;
  try {
    const connect = await mongoose.connect(dbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Database connected successfully at: ', connect.connection.name);
  } catch (err) {
    console.log('There was an error connecting to MongoDB:', err);
    throw err;
  }
};

module.exports = connectDb;