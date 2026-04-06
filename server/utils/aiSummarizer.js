// server/utils/aiSummarizer.js

const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generates a concise summary for a given article content using the Google Gemini API.
 * @param {string} content - The full text content of the article.
 * @returns {Promise<string>} The generated summary string (max 300 chars).
 */
async function generateSummary(content) {
    if (!content || content.length < 50) {
        return "Content is too short to generate a meaningful summary.";
    }

    try {
        // UPDATED FOR 2026: Using the stable Gemini 3.1 Flash-Lite preview
        const model = genAI.getGenerativeModel({ 
            model: "gemini-3.1-flash-lite-preview",
            generationConfig: {
                maxOutputTokens: 120, // Keep it short
                temperature: 0.3, 
            }
        });

        const prompt = `Summarize the following article for GuffSuff. 
                        Keep it under 250 characters and focus on the main takeaway.
                        
                        Article: \n\n${content}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let summary = response.text().trim();

        // SAFETY CROP: Absolute check to ensure it fits your 300-char DB limit
        if (summary.length > 300) {
            summary = summary.substring(0, 297) + "...";
        }

        return summary || "Summary could not be generated.";
        
    } catch (error) {
        console.error("Gemini Summary Generation Error:", error.message);
        
        // Return a short string to prevent Mongoose validation errors
        if (error.message.includes("429")) {
            return "AI busy (Rate limit). Try again in a minute.";
        }
        
        return "Summary failed to generate due to an AI error.";
    }
}

module.exports = { generateSummary };