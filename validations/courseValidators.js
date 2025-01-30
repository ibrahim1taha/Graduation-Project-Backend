const { body } = require('express-validator');

const validators = {
	courseValidations: [
		body('title', 'This field must be more that 4 letters!').isLength({ min: 5 }),
		body('description', 'This field must be more that 4 letters!').isLength({ min: 5 }),
		body('price', 'Price must be a non-negative number!').isNumeric().custom(val => val >= 0),
		body('topic').trim().toLowerCase(),
		body('level', 'unknown course level').trim().toLowerCase().isIn(['beginner', 'intermediate', 'advanced']),
		body('sessions.*.startDate', 'Invalid date format! Use ISO 8601!').isISO8601().toDate(),
		body('sessions.*.title', 'Invalid date format! Use ISO 8601!').isLength({ min: 5 }),
	],
}

module.exports = validators; 