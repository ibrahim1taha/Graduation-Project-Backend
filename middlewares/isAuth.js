const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb')
const customErr = require('../utils/customErr');
const userModel = require('../models/users');

const authorized = async (req, res, next) => {
	try {
		const auth = req.get('Authorization');
		if (!auth?.startsWith('Bearer ')) {
			customErr(401, 'Unauthorized');
		}
		const token = auth.split(' ')[1];

		const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

		if (!decodedToken?.userId) customErr(401, "Not authorized!");

		const userId = new ObjectId(decodedToken.userId);

		const user = await userModel.findById(userId);

		if (!user) customErr(404, "user not found !");

		req.userId = userId;
		req.userRole = decodedToken.role;

		next();

	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
			err.message = 'Internal server error';
		}
		console.log(err);
		next(err);
	}
}

const isInstructor = (req, res, next) => {
	if (req.userRole !== 'instructor') customErr(401, 'Not authorized for this action!');
	next();
}

module.exports = { authorized, isInstructor }  