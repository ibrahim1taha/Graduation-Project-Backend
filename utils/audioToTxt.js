const apiKey = "AIzaSyDoFaKAnYPITG8BaILlkXCgewtrRs14-ZQ";
const URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
////////////////////

const { AssemblyAI } = require("assemblyai");
const CallAiServices = require('./callAiServices'); 


const client = new AssemblyAI({
  apiKey: "b23cf565f16c43aab6bf7cf55962321f",
});

const generateArticle = async (audioFile) => {
	const params = {
		audio: audioFile.buffer,
		speech_model: "universal",
	};

	const transcript = await client.transcripts.transcribe(params);

	const article = await CallAiServices.callGeminiApi(transcript.text , URL) ;
	
	const cleanedJson = article
	.replace(/^```json\n/, "")
	.replace(/```$/, "")
	.trim();
	
	const parsedArticle = JSON.parse(cleanedJson);

	return parsedArticle;
}

module.exports = generateArticle ; 