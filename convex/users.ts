import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const syncUser = mutation({
  args: {
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    clerkId: v.optional(v.string()),
    image: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let name = args.name;
    let email = args.email;
    let clerkId = args.clerkId;
    let image = args.image;

    if (!clerkId) {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        throw new Error("Not authenticated");
      }
      clerkId = identity.subject;
      name = identity.name || "Anonymous";
      email = identity.email || "";
      image = identity.pictureUrl;
    }

    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .first();

    if (existingUser) return existingUser;

    return await ctx.db.insert("users", {
      clerkId,
      name: name || "Anonymous",
      email: email || "",
      image,
      role: "interviewer",
    });
  },
});

export const getUsers = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("User is not authenticated");

    const users = await ctx.db.query("users").collect();

    return users;
  },
});

export const getUserByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    return user;
  },
});

export const makeAllUsersInterviewers = mutation({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    for (const user of users) {
      await ctx.db.patch(user._id, { role: "interviewer" });
    }
    return users.length;
  },
});

export const seedCandidates = mutation({
  handler: async (ctx) => {
    const mockCandidates = [
      { name: "Sarah Connor", email: "sarah@example.com", clerkId: "mock_candidate_1", role: "candidate" as const },
      { name: "John Doe", email: "john@example.com", clerkId: "mock_candidate_2", role: "candidate" as const },
      { name: "Alice Smith", email: "alice@example.com", clerkId: "mock_candidate_3", role: "candidate" as const },
    ];

    for (const cand of mockCandidates) {
      const existing = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", cand.clerkId))
        .first();
      if (!existing) {
        await ctx.db.insert("users", cand);
      }
    }
    return mockCandidates.length;
  },
});

export const addMockInterviewer = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { role: "interviewer" });
      return existing;
    }

    return await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      clerkId: args.clerkId,
      role: "interviewer",
    });
  },
});



