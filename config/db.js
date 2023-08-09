const mongoose = require('mongoose');

// Replace 'YOUR_CONNECTION_STRING' with your actual MongoDB connection string

// Options object (optional, use to configure the connection)

const connectDB = async () => {
    try {
        // Connect to MongoDB using Mongoose
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('``````Connected to MongoDB successfully!```````');
        // Start your application or perform operations on the database
    } catch (error) {
        console.error('Error connecting to MongoDB:', error.message);
        process.exit(1);
        // Handle any errors that occur during the connection
    }
}

module.exports = connectDB;

