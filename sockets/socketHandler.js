const socket = require('./socket');

module.exports = (io) => {
	io.on('connection', socket => {
		console.log(`${socket.id} connected`);

		socket.on('joinRoom', (groupId) => {
			socket.join(groupId);
			console.log(`${socket.id} joined room: ${groupId} -- rooms size = ${socket.rooms.size}`);
		})

		socket.on('leaveRoom', (groupId) => {
			socket.leave(groupId);
			console.log(`${socket.id} leaved room: ${groupId} -- rooms size = ${socket.rooms.size}`);
		})

		socket.on('disconnect', () => {
			console.log(`${socket.id} disconnected ---- rooms size = ${socket.rooms.size}`);
		})
	})
}