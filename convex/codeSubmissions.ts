import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const submitCode = mutation({
  args: {
    interviewId: v.optional(v.string()),
    code: v.string(),
    language: v.string(),
    question: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    return await ctx.db.insert("codeSubmissions", {
      interviewId: args.interviewId,
      code: args.code,
      language: args.language,
      question: args.question,
      submittedBy: identity.subject,
    });
  },
});

export const updateAIReview = mutation({
  args: {
    id: v.id("codeSubmissions"),
    aiReview: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    return await ctx.db.patch(args.id, {
      aiReview: args.aiReview,
    });
  },
});

export const getSubmissions = query({
  args: {
    interviewId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    if (!args.interviewId) return [];

    const submissions = await ctx.db
      .query("codeSubmissions")
      .withIndex("by_interview_id", (q) => q.eq("interviewId", args.interviewId))
      .order("desc")
      .take(20);

    return submissions;
  },
});
