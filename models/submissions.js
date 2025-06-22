const mongoose = require('mongoose'); 
const ObjectId = mongoose.Schema.Types.ObjectId

const submissionSchema = mongoose.Schema({
	userId : {
		type : ObjectId , 
		ref : 'Users', 

	}, 
	userName : {
		type : String , 
		required : true 
	},
	userPhoto : {
		type : String , 
		required : true 
	},
	quizId: {
		type: ObjectId,
		ref: "quiz",
		required: true,
	}, 
	sessionId: {
		type: ObjectId,
		ref: "sessions",
		required: true,
	},
	courseId: {
		type: ObjectId,
		ref: "courses",
		required: true,
	},
	answers : [
		{
			questionId : {type : ObjectId , required: true} , 
			answer : {type :String , required: true} , 
			isCorrect : {type : Boolean , required: true } 
		}
	]
	, 
	totalPointsEarned : {
		type : Number , 
		required : true
	}, 
	totalPointsPossible : {
		type : Number , 
		required : true 
	}


} , {timestamps : true})


module.exports = mongoose.model('submissions' , submissionSchema); 