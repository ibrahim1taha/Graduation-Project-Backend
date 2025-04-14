const socket = require('./socket');

const liveSessionController = require('../controllers/liveSessionController');

module.exports = (io) => {
	io.on('connection', socket => {
		console.log(`${socket.id} connected`);

		// join chat room
		socket.on('joinRooms', (groups) => {
			socket.join(groups.groupsId);
			console.log(groups.groupsId);
		})

		socket.on('leaveRoom', (groupId) => {
			socket.leave(groupId);
			console.log(`${socket.id} leaved room: ${groupId} -- rooms size = ${socket.rooms.size}`);
		})

		/////////////////////////live session///////////////////////

		socket.on('join-session-room', async ({ sessionId, userId }) => {
			socket.join(sessionId);
			await liveSessionController.joinLiveSession(sessionId, userId, socket); //include emit ->  user-connected , existing-users
		})

		socket.on('media-control', data => {
			socket.to(data.sessionId).emit('media-control', data);
		})

		socket.on('offer', data => {
			io.to(data.sessionId).emit('offer', data);
		})

		socket.on('ice-candidate', data => {
			socket.to(data.sessionId).emit('ice-candidate', data);
		})

		socket.on('answer', data => {
			io.to(data.sessionId).emit('answer', data);
		})

		socket.on('end-live-session', async ({ sessionId, userId }) => {
			socket.leave(sessionId);
			await liveSessionController.leaveLiveSession(sessionId, userId, socket);
			// front should listen to [one-leaved-session] to get updated attendance 
		})

		///////////////////////
		socket.on('disconnect', () => {
			socket.rooms.forEach(room => {
				socket.leave(room);
			});
			console.log(`${socket.id} disconnected and left all rooms`);
		})
	})
}