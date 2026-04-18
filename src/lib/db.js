import mongoose from "mongoose";

const connectDB = async (mongoUri) => {
  if (!mongoUri) {
    throw new Error(
      "[express-auth-kit] mongoUri is required to connect to MongoDB",
    );
  }

  try {
    const conn = await mongoose.connect(mongoUri);
    console.log(
      `[express-auth-kit] MongoDB connected: ${conn.connection.host}`,
    );
  } catch (error) {
    console.error(
      `[express-auth-kit] MongoDB connection error: ${error.message}`,
    );
    throw error;
  }
};

export default connectDB;
