const sessionsModel = require('../models/sessions');
const customErr = require('../utils/customErr');

const coursesModel = require('../models/courses');
const usersModel = require('../models/users');


class liveSessionController {

	static async joinLiveSession(sessionId, userId, socket) {
		try {
			const session = await sessionsModel.findById(sessionId);
			if (!session) return socket.emit('error', 'Session not found!');

			const course = await coursesModel.findById(session.courseId);
			if (!course) return socket.emit('error', 'Course not found!');

			const user = await usersModel.findById(userId, { userId: userId, userName: 1, role: 1 });
			if (!user) return socket.emit('error', 'Course not found!');

			if (course.instructor == userId && session.status !== 'ended')
				session.status = 'running'; // make sure 'running' is a string

			if (!session.attendance.some(obj => obj.userId == userId))
				session.attendance.push(user);

			await session.save();

			socket.broadcast.to(sessionId).emit('user-connected', user);
			socket.emit('existing-users', session.attendance);

		} catch (err) {
			socket.emit('error', 'Can not join the session!');
			console.log(err);
		}
	}


	static async leaveLiveSession(sessionId, userId, socket) {
		try {
			const session = await sessionsModel.findById(sessionId);
			if (!session) return socket.emit('error', 'Session not found!');

			session.attendance = session.attendance.filter(obj => obj.userId.toString() !== userId);

			await session.save();

			socket.to(sessionId).emit('one-leaved-session', userId);
		} catch (err) {
			socket.emit('error', 'Can not leave the session!');
			console.log(err);
		}
	}

}

module.exports = liveSessionController; 