const mongoose = require('mongoose');

const connectDB = async (req, res, next) => {
	try {
		await mongoose.connect(process.env.DB_URI)
		console.log('MongoDB connected successfully');
	} catch (error) {
		console.error('MongoDB connection error:', error);
		process.exit(1);
	}
}

module.exports = connectDB;