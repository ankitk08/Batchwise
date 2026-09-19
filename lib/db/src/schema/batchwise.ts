import {
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const batchwiseWorkspacesTable = pgTable("batchwise_workspaces", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  ownerUserId: text("owner_user_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const batchwiseUsersTable = pgTable(
  "batchwise_users",
  {
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => batchwiseWorkspacesTable.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull(),
    displayName: text("display_name").notNull(),
    role: text("role").notNull().default("owner"),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).notNull().defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.workspaceId, table.userId] })],
);

export const batchwiseRunsTable = pgTable(
  "batchwise_runs",
  {
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => batchwiseWorkspacesTable.id, { onDelete: "cascade" }),
    id: text("id").notNull(),
    payload: jsonb("payload").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  },
  (table) => [
    primaryKey({ columns: [table.workspaceId, table.id] }),
    index("batchwise_runs_workspace_idx").on(table.workspaceId),
  ],
);

export const batchwiseUploadsTable = pgTable(
  "batchwise_uploads",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => batchwiseWorkspacesTable.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull(),
    fileName: text("file_name").notNull(),
    sizeBytes: integer("size_bytes").notNull(),
    rowCount: integer("row_count").notNull(),
    analysis: jsonb("analysis").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("batchwise_uploads_workspace_idx").on(table.workspaceId)],
);

export const batchwiseQuestionsTable = pgTable(
  "batchwise_questions",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => batchwiseWorkspacesTable.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull(),
    question: text("question").notNull(),
    answer: jsonb("answer").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("batchwise_questions_workspace_idx").on(table.workspaceId)],
);

export const insertBatchwiseUploadSchema = createInsertSchema(batchwiseUploadsTable).omit({
  createdAt: true,
});
export type InsertBatchwiseUpload = z.infer<typeof insertBatchwiseUploadSchema>;
export type BatchwiseUpload = typeof batchwiseUploadsTable.$inferSelect;