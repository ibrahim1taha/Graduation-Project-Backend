const mongoose = require("mongoose");

const quizSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    sessionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "sessions",
        required: true,
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "courses",
        required: true,
    },
    questions: [
        {
			questionId:{ type: mongoose.Schema.Types.ObjectId, required: true } ,
			questionTitle : { type : String , required : true } , 
			options : [
				{
					optionId : {type : String , required : true} , 
					optionText : {type : String , required : true} , 
					// isCorrect : {type : Boolean , required : true , default : 'false'}
				}
			] , 
			correctAnswer: {
				type: String , 
				required: true
			}
        }
	],
} , { timestamps: true } );


module.exports = mongoose.model("quiz", quizSchema);