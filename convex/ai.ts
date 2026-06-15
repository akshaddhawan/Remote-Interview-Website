"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";

export const reviewCode = action({
  args: {
    code: v.string(),
    language: v.string(),
    question: v.string(),
  },
  handler: async (ctx, args) => {
    const { code, language, question } = args;

    const prompt = `You are an expert code reviewer for technical interviews. Analyze the following ${language} code submission for the problem "${question}".

Code:
\`\`\`${language}
${code}
\`\`\`

Provide a structured review in the following JSON format (return ONLY valid JSON, no markdown):
{
  "correctness": {
    "score": <1-10>,
    "feedback": "<brief assessment of correctness>"
  },
  "efficiency": {
    "score": <1-10>,
    "feedback": "<time/space complexity analysis>"
  },
  "codeQuality": {
    "score": <1-10>,
    "feedback": "<readability, naming, structure>"
  },
  "suggestions": ["<improvement 1>", "<improvement 2>"],
  "overallScore": <1-10>,
  "summary": "<2-3 sentence overall assessment>"
}`;

    try {
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        // Return mock review if no API key configured
        return JSON.stringify({
          correctness: { score: 7, feedback: "The solution handles the basic cases correctly. Consider edge cases like empty inputs." },
          efficiency: { score: 6, feedback: "Current approach is O(n²). A hash map approach would reduce to O(n)." },
          codeQuality: { score: 8, feedback: "Clean and readable code. Good variable naming conventions." },
          suggestions: [
            "Consider using a hash map for O(n) time complexity",
            "Add input validation for edge cases",
            "Include comments explaining the algorithm approach"
          ],
          overallScore: 7,
          summary: "Solid foundational solution that handles core cases well. The main area for improvement is optimizing time complexity from O(n²) to O(n) using a hash map. Code style and readability are excellent."
        });
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 1024,
            },
          }),
        }
      );

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return jsonMatch[0];
      }

      return text;
    } catch (error) {
      console.error("AI review error:", error);
      return JSON.stringify({
        correctness: { score: 0, feedback: "Unable to analyze code at this time." },
        efficiency: { score: 0, feedback: "Analysis unavailable." },
        codeQuality: { score: 0, feedback: "Analysis unavailable." },
        suggestions: ["Please try again later."],
        overallScore: 0,
        summary: "AI analysis is temporarily unavailable. Please try again."
      });
    }
  },
});

export const generateInterviewSummary = action({
  args: {
    candidateName: v.string(),
    interviewTitle: v.string(),
    comments: v.array(
      v.object({
        content: v.string(),
        rating: v.number(),
        interviewerName: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const { candidateName, interviewTitle, comments } = args;

    if (comments.length === 0) {
      return JSON.stringify({
        summary: "No interviewer feedback available yet.",
        strengths: [],
        improvements: [],
        overallScore: 0,
      });
    }

    const commentList = comments
      .map(
        (c) => `- ${c.interviewerName} (Rating: ${c.rating}/5): "${c.content}"`
      )
      .join("\n");

    const prompt = `You are an HR analytics assistant. Summarize the following interview feedback for candidate "${candidateName}" in the "${interviewTitle}" interview.

Feedback:
${commentList}

Provide a structured summary in JSON format (return ONLY valid JSON, no markdown):
{
  "summary": "<3-4 sentence summary of overall performance>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "improvements": ["<area 1>", "<area 2>"],
  "overallScore": <1-10 based on average ratings and sentiment>
}`;

    try {
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        const avgRating =
          comments.reduce((sum, c) => sum + c.rating, 0) / comments.length;
        return JSON.stringify({
          summary: `${candidateName} received ${comments.length} review(s) with an average rating of ${avgRating.toFixed(1)}/5 for the ${interviewTitle} interview. Overall feedback suggests a competent candidate with room for growth.`,
          strengths: ["Good communication skills", "Solid technical fundamentals", "Collaborative attitude"],
          improvements: ["Time management during coding", "Could explain approach more clearly"],
          overallScore: Math.round(avgRating * 2),
        });
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.4,
              maxOutputTokens: 512,
            },
          }),
        }
      );

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return jsonMatch[0];
      }

      return text;
    } catch (error) {
      console.error("AI summary error:", error);
      return JSON.stringify({
        summary: "AI summary is temporarily unavailable.",
        strengths: [],
        improvements: [],
        overallScore: 0,
      });
    }
  },
});
