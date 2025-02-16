const { Server } = require('socket.io');

let io;

module.exports = {
	init: (httpServer) => {
		io = new Server(httpServer, {
			cors: { origin: '*' }
		});
		return io;
	},

	getIo: () => {
		if (!io)
			throw new Error('Socket.IO instance not initialized');
		return io;
	}
}