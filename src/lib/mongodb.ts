import mongoose from 'mongoose';

const MONGODB_URI = import.meta.env.VITE_MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the VITE_MONGODB_URI environment variable');
}

let isConnected = false;

export async function connectToDatabase() {
  if (isConnected) {
    return;
  }

  try {
    await mongoose.connect(MONGODB_URI);
    isConnected = true;
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    isConnected = false;
    throw error;
  }
}