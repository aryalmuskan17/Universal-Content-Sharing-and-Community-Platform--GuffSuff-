// server/utils/aiSummarizer.js

const { OpenAI } = require('openai');

// Initialize OpenAI client
// The API key is automatically read from the OPENAI_API_KEY environment variable
const openai = new OpenAI(); 

/**
 * Generates a concise summary for a given article content using the OpenAI API.
 * @param {string} content - The full text content of the article.
 * @returns {Promise<string>} The generated summary string.
 */
async function generateSummary(content) {
    if (!content || content.length < 50) {
        return "Content is too short to generate a meaningful summary.";
    }

    const prompt = `Please provide a concise summary of the following article content. The summary must be under 300 characters and focus on the main topic and key takeaways. Article: \n\n${content}`;

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo", // A fast and cost-effective model for summarization
            messages: [
                { role: "system", content: "You are an expert editor specializing in writing extremely concise and accurate article summaries, limited to 300 characters." },
                { role: "user", content: prompt }
            ],
            max_tokens: 100, // Sufficient tokens to generate a short summary
            temperature: 0.3, // Lower temperature for more focused, factual output
        });

        // The summary is typically in the first choice's message content
        const summary = response.choices[0].message.content.trim();
        return summary;
        
    } catch (error) {
        console.error("OpenAI Summary Generation Error:", error.message);
        // Return a helpful error message instead of failing the entire route
        return `Failed to generate AI summary: ${error.message}`;
    }
}

module.exports = { generateSummary };