const mongoose = require('mongoose');

const testSchema = mongoose.Schema({
	name: String
})

module.exports = mongoose.model('test', testSchema);; 