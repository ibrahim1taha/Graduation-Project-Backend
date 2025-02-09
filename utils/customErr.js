module.exports = (statusCode, message, path) => {
	const err = new Error;
	err.statusCode = statusCode;
	err.path = path
	err.message = message;
	throw err;
}