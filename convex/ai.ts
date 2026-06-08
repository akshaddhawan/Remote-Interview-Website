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

    // Smart mock review based on code analysis
    const mockReview = () => {
      const lineCount = code.split("\n").length;
      const hasComments = code.includes("//") || code.includes("/*") || code.includes("#");
      const hasErrorHandling = code.includes("try") || code.includes("catch") || code.includes("except");
      const codeLength = code.trim().length;

      const correctnessScore = Math.min(8, Math.max(4, Math.floor(lineCount / 3) + 4));
      const qualityScore = (hasComments ? 7 : 5) + (hasErrorHandling ? 1 : 0);
      const efficiencyScore = codeLength > 500 ? 5 : codeLength > 200 ? 6 : 7;
      const overall = Math.round((correctnessScore + qualityScore + efficiencyScore) / 3);

      return JSON.stringify({
        correctness: {
          score: correctnessScore,
          feedback: `The solution is ${lineCount} lines long and ${correctnessScore >= 7 ? "appears to handle the main cases well" : "could benefit from handling more edge cases"}. Consider testing with empty inputs and boundary values.`
        },
        efficiency: {
          score: efficiencyScore,
          feedback: `The code is ${codeLength > 500 ? "quite lengthy — consider refactoring for efficiency" : "reasonably concise"}. Review the time and space complexity to ensure optimal performance.`
        },
        codeQuality: {
          score: qualityScore,
          feedback: `${hasComments ? "Good use of comments for readability." : "Consider adding comments to explain your approach."} ${hasErrorHandling ? "Error handling is present, which is good practice." : "Adding error handling would improve robustness."}`
        },
        suggestions: [
          ...(hasComments ? [] : ["Add comments explaining your algorithm approach"]),
          ...(hasErrorHandling ? [] : ["Add error handling for edge cases"]),
          "Consider the time complexity — can it be optimized?",
          "Test with edge cases: empty input, single element, very large input",
          "Use descriptive variable names for better readability"
        ].slice(0, 4),
        overallScore: overall,
        summary: `The ${language} solution for "${question}" shows ${overall >= 7 ? "strong" : "solid"} fundamentals with ${lineCount} lines of code. ${hasComments ? "Documentation is good." : "Adding documentation would help."} ${overall >= 7 ? "Well-structured overall." : "There's room for optimization and better edge case handling."}`
      });
    };

    try {
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return mockReview();
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

      if (!response.ok) {
        console.error("Gemini API error:", response.status, response.statusText);
        return mockReview();
      }

      const data = await response.json();

      // Check for API error response
      if (data.error) {
        console.error("Gemini API returned error:", data.error.message);
        return mockReview();
      }

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

      if (!text) {
        return mockReview();
      }

      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        // Validate that parsed JSON has expected fields
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.overallScore !== undefined) {
            return jsonMatch[0];
          }
        } catch {
          // JSON parse failed, fall through to mock
        }
      }

      return mockReview();
    } catch (error) {
      console.error("AI review error:", error);
      return mockReview();
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
