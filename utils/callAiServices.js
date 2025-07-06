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
Simulate Student Notes:
Write the article as if a diligent student is taking notes during the lecture or right after class. Use clear headers, bullets, and short explanations — no fluff.

Preserve Core Teaching Style:
Mirror the instructor’s teaching approach, examples, and logical flow. Even if phrased concisely, the teaching voice and emphasis should feel familiar.

Summarize Key Concepts Clearly:
Focus on core ideas and important examples. Skip over tangents or lengthy elaborations, unless critical to understanding.

Compact but Complete:
Capture all essential knowledge presented — just make it more concise and skimmable.

Educational Links for Crucial Topics:
For especially important concepts, add links in this format:
👉 Concept Name
Choose high-quality resources (e.g., MDN, freeCodeCamp, GeeksforGeeks, W3Schools, official docs).

Readable, Note-Like Format:
Think like a student: use bullet points, numbered lists, quick definitions, small code snippets (if needed), and clear headers.
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