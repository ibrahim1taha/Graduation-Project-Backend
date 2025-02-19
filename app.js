const express = require('express');
const path = require('path');
require('dotenv').config();
const cors = require('cors')
const port = process.env.PORT;
const app = express();
const { createServer } = require('http');
const socket = require('./sockets/socket');
const socketHandler = require('./sockets/socketHandler');

const connectDB = require('./config/db_connection');
// run database
connectDB();

const httpServer = createServer(app);
socket.init(httpServer);
const io = socket.getIo();
socketHandler(io);
const authRouter = require('./routes/authRoutes');
const coursesRouter = require('./routes/courseRoutes');
const groupChatRouter = require('./routes/groupChatRoutes');

//allows a server to indicate any origins (domain, scheme, or port)
app.use(cors());
// parse incoming requests.
app.use(express.json());

// serve image files 
app.use('/image', express.static(path.join(__dirname, 'public/images')));

app.use('/courses', coursesRouter);
app.use('/groups', groupChatRouter);
app.use('/auth', authRouter);

app.use((error, req, res, next) => {
	const status = error.statusCode || 500;
	res.status(status).json({
		status: status,
		path: error.path,
		message: error.message
	})
})

httpServer.listen(port, () => {
	console.log(`___ Server run successfully on port = ${port} ___`);
})