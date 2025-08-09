const apiKey = process.env.API_KEY
const URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
////////////////////

const { AssemblyAI } = require("assemblyai");
const CallAiServices = require('./callAiServices'); 


const client = new AssemblyAI({
  apiKey: process.env.AssemblyAI_API_KEY,
});

const generateArticle = async (audioFile) => {
	console.log(audioFile); 
	const params = {
		audio: audioFile.buffer,
		speech_model: "universal",
		// language_code: "ar", 
	};

	const transcript = await client.transcripts.transcribe(params);
	
	if(!transcript.text || transcript.text.length < 200) 
		return null ; 

	const article = await CallAiServices.callGeminiApi(transcript.text , URL) ;

	const cleanedJson = article
	.replace(/^```json\n/, "")
	.replace(/```$/, "")
	.trim();
	
	const parsedArticle = JSON.parse(cleanedJson);

	return parsedArticle;
}

module.exports = generateArticle ; 