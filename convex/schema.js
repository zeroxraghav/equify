import {defineSchema, defineTable} from "convex/server";
import {v} from "convex/values";

export default defineSchema({
    users: defineTable({
        name: v.string(),
        email: v.string(),
        tokenIdentifier: v.string(),
        imageURL: v.optional(v.string()),
    }).index("by_token", ["tokenIdentifier"]).searchIndex("search_name", {searchField: "name"}).searchIndex("search_email", {searchField: "email"}),

    expenses: defineTable({
        description: v.string(),
        amount: v.number(),
        category: v.optional(v.string()),
        date: v.number(),
        paidBy: v.id("users"),
        splitType: v.string(), 
        splits: v.array(
            v.object({
                userId: v.id("users"),
                amount: v.number(),  
                hasPaid: v.boolean(),
            })
        ),
        groupId: v.optional(v.id("groups")),
        createdBy: v.id("users"),
    }).index("by_group", ["groupId"]).index("by_date", ["date"]).index("by_user_and_group", ["paidBy", "groupId"]),

    groups: defineTable({
        name: v.string(),
        description: v.string(),
        createdBy: v.id("users"),
        members: v.array(v.id("users")),
    }).index("by_member", ["members"]),

    settlements: defineTable({
        amount: v.number(),
        note: v.string(),
        date: v.number(),
        paidBy: v.id("users"),
        paidTo: v.id("users"),
        groupId: v.optional(v.id("groups")),
        createdBy: v.id("users"),
        relatedExpenses: v.optional(v.array(v.id("expenses"))),
    }).index("by_group", ["groupId"]).index("by_user_and_group", ["paidBy", "groupId"]).index("by_receiver_and_group", ["paidTo", "groupId"])
});