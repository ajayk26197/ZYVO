import mongoose from 'mongoose';

export const connectDB = async () => {
  const MAX_RETRIES = 5;
  let retries = 0;

  const connect = async () => {
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 10000,
      });
      console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    } catch (err) {
      retries++;
      console.error(`❌ MongoDB connection attempt ${retries}/${MAX_RETRIES} failed: ${err.message}`);

      if (err.message.includes('whitelist') || err.message.includes('Atlas')) {
        console.error('\n⚠️  FIX: Go to MongoDB Atlas → Network Access → Add your current IP or allow 0.0.0.0/0\n');
      }

      if (retries < MAX_RETRIES) {
        console.log(`🔄 Retrying in 5 seconds...`);
        await new Promise(r => setTimeout(r, 5000));
        return connect();
      } else {
        console.error('❌ All connection attempts failed. Server will exit.');
        process.exit(1);
      }
    }
  };

  await connect();
};
