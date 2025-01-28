const courseModel = require('../models/courses');
const sessionsModel = require('../models/sessions');


const courseController = {
	addCourse: async (req, res, next) => {
		try {
			// validation res should be here 

			const { title, price, description, topic, level, instructor, sessions } = req.body;

			const course = await courseModel.create({
				title: title, price: price, description: description, topic: topic
				, level: level, instructor: req.userId
			})

			if (sessions.length > 0) {
				// console.log(sessions);
				for (const session of sessions) {
					console.log(session);
					await sessionsModel.create({ course: course._id, title: session.title, startDate: session.startDate })
				}
			}

			res.status(201).json({
				message: `course created successfully with ${sessions.length} session added`,
			})

		} catch (err) {
			console.log(err);
			next(err);
		}

	}
}


module.exports = courseController; 