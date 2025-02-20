const socket = require('./socket');

module.exports = (io) => {
	io.on('connection', socket => {
		console.log(`${socket.id} connected`);

		socket.on('joinRooms', (groups) => {
			socket.join(groups.groupsId);
			console.log(groups.groupsId);
		})

		socket.on('leaveRoom', (groupId) => {
			socket.leave(groupId);
			console.log(`${socket.id} leaved room: ${groupId} -- rooms size = ${socket.rooms.size}`);
		})

		socket.on('disconnect', () => {
			socket.rooms.forEach(room => {
				socket.leave(room);
			});
			console.log(`${socket.id} disconnected and left all rooms`);
		})
	})
}