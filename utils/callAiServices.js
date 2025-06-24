////////////////////////////////////////////////////////////

const axios = require("axios");

class CallAiServices {
	
	static async callGeminiApi(transcript, URL) {
		const result = await axios.post(URL, {
			contents: [
				{ parts: [{ text: CallAiServices.Prompt(transcript) }] },
			],
			generationConfig: {
				temperature: 0.5,
				maxOutputTokens: 2048,
			},
		});

		const output = result.data?.candidates?.[0]?.content?.parts?.[0]?.text || " ";
		if (!output) {
			customErr(400, "Missing required fields");
		}

		return output;
	}

	static Prompt(transcript) {
		return `Transform this instructor's speech transcript into a comprehensive article that captures their teaching style and complete message.

**TRANSCRIPT:**[${transcript}]

**REQUIREMENTS:**
- Create a well-structured article that summarizes the instructor's key points
- Maintain the instructor's teaching style and important examples
- Focus on main concepts while condensing lengthy explanations
- Include ALL essential knowledge but in a more concise format
- Add markdown links to relevant educational resources for the most crucial topics: [Important Concept Name](actual-url-to-quality-educational-content)
- Target readable length (instructor should recognize their core message without excessive detail)

**OUTPUT FORMAT (JSON):**
{
  "title": "Descriptive title based on lecture topic",
  "content": "Full article in markdown with embedded links for further study",
  "readingTime": "X minutes"
}

Write a complete article that preserves the instructor's voice and comprehensive content. Respond ONLY with valid JSON.`;
	}

}

module.exports = CallAiServices ; 