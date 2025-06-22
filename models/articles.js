const mongoose = require('mongoose') ; 
const ObjectId = mongoose.Schema.Types.ObjectId; 

const articleSchema = mongoose.Schema({
	courseId : {
		type : ObjectId , 
		res : 'courses' , 
		required : true 
	}, 
	sessionId : {
		type : ObjectId , 
		res : 'sessions' , 
		required : true 
	}, 
	title : {
		type :String , 
		content : String , 
		required : true 
	},
	contentUrl : {
		type :String , 
		content : String , 
		required : true 
	},
	readingTime : {
		type :String , 
		content : String , 
		required : true 
	},
})

module.exports = mongoose.model("articles", articleSchema);