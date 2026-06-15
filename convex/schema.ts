import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    image: v.optional(v.string()),
    role: v.union(v.literal("candidate"), v.literal("interviewer")),
    clerkId: v.string(),
  }).index("by_clerk_id", ["clerkId"]),

  interviews: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    startTime: v.number(),
    endTime: v.optional(v.number()),
    status: v.string(),
    streamCallId: v.string(),
    candidateId: v.string(),
    interviewerIds: v.array(v.string()),
  })
    .index("by_candidate_id", ["candidateId"])
    .index("by_stream_call_id", ["streamCallId"]),

  comments: defineTable({
    content: v.string(),
    rating: v.number(),
    interviewerId: v.string(),
    interviewId: v.id("interviews"),
  }).index("by_interview_id", ["interviewId"]),

  codeSubmissions: defineTable({
    interviewId: v.optional(v.string()),
    code: v.string(),
    language: v.string(),
    question: v.string(),
    aiReview: v.optional(v.string()),
    submittedBy: v.string(),
  }).index("by_interview_id", ["interviewId"]),

  aiSummaries: defineTable({
    interviewId: v.id("interviews"),
    summary: v.string(),
    strengths: v.array(v.string()),
    improvements: v.array(v.string()),
    overallScore: v.number(),
  }).index("by_interview_id", ["interviewId"]),

  notes: defineTable({
    interviewId: v.id("interviews"),
    interviewerId: v.string(),
    content: v.string(),
  })
    .index("by_interview_id", ["interviewId"])
    .index("by_interview_id_and_interviewer_id", ["interviewId", "interviewerId"]),
});
