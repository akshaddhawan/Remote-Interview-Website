import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getNote = query({
  args: {
    interviewId: v.id("interviews"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const note = await ctx.db
      .query("notes")
      .withIndex("by_interview_id_and_interviewer_id", (q) =>
        q.eq("interviewId", args.interviewId).eq("interviewerId", identity.subject)
      )
      .first();

    return note;
  },
});

export const saveNote = mutation({
  args: {
    interviewId: v.id("interviews"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const existing = await ctx.db
      .query("notes")
      .withIndex("by_interview_id_and_interviewer_id", (q) =>
        q.eq("interviewId", args.interviewId).eq("interviewerId", identity.subject)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { content: args.content });
      return existing._id;
    }

    return await ctx.db.insert("notes", {
      interviewId: args.interviewId,
      interviewerId: identity.subject,
      content: args.content,
    });
  },
});
