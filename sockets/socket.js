const { Server } = require('socket.io');

let io;

module.exports = {
	init: (httpServer, options = {}) => {
		if (io) {
			console.warn('Socket.IO already initialized');
			return io;
		}

		const defaultOptions = {
			cors: { 
				origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
				methods: ['GET', 'POST']
			},
			transports: ['websocket', 'polling'],
			pingTimeout: 60000,
			pingInterval: 25000
		};

		io = new Server(httpServer, { ...defaultOptions, ...options });
		console.log('Socket.IO initialized successfully');
		return io;
	},

	getIo: () => {
		if (!io)
			throw new Error('Socket.IO instance not initialized. Call init() first.');
		return io;
	},

	// Helper method to emit from anywhere in your app
	emit: (event, data) => {
		if (!io) {
			console.warn('Socket.IO not initialized, cannot emit');
			return false;
		}
		io.emit(event, data);
		return true;
	},

	// Helper method to emit to specific room
	emitToRoom: (room, event, data) => {
		if (!io) {
			console.warn('Socket.IO not initialized, cannot emit to room');
			return false;
		}
		io.to(room).emit(event, data);
		return true;
	}
}