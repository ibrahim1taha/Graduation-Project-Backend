const express = require('express');
require('dotenv').config();
const cors = require('cors')
const port = process.env.PORT;
const app = express();
const connectDB = require('./config/db_connection');
const testModel = require('./models/test');
// run database
connectDB();

//allows a server to indicate any origins (domain, scheme, or port)
app.use(cors());
// parse incoming requests.
app.use(express.json());

app.listen(port, () => {
	console.log(`___ Server run successfully on port = ${port} ___`);
})