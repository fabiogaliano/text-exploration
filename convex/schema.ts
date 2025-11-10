import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const schema = defineSchema({
  ...authTables,
  // Add any additional custom tables here
  // Example:
  // posts: defineTable({
  //   title: v.string(),
  //   content: v.string(),
  //   authorId: v.id("users"),
  // }).index("by_author", ["authorId"]),
});

export default schema;
