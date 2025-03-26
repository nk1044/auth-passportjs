import mongoose from 'mongoose';

export const connectDb = async () => {
    try {
        const instance = await mongoose.connect(`${process.env.DB_URL}`);
        console.log('MongoDB connected', instance.connection.host);
    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }
    };