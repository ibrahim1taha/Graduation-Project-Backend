const express = require('express');
require('dotenv').config();
const cors = require('cors')
const port = process.env.PORT;
const app = express();
const connectDB = require('./config/db_connection');
// run database
connectDB();

const authRouter = require('./routes/authRoutes');
const coursesRouter = require('./routes/courseRoutes');

//allows a server to indicate any origins (domain, scheme, or port)
app.use(cors());
// parse incoming requests.
app.use(express.json());

app.use('/', coursesRouter);
app.use('/auth', authRouter);

app.use((error, req, res, next) => {
	const status = error.statusCode || 500;
	res.status(status).json({
		status: status,
		message: error.message
	})
})

app.listen(port, () => {
	console.log(`___ Server run successfully on port = ${port} ___`);
})