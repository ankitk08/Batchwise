import type { Request } from "express";
import { getAuth } from "@clerk/express";
import { count, desc, eq } from "drizzle-orm";
import {
  batchwiseQuestionsTable,
  batchwiseRunsTable,
  batchwiseUploadsTable,
  batchwiseUsersTable,
  batchwiseWorkspacesTable,
  db,
} from "@workspace/db";
import { productionRuns } from "./food-prototype-data";

export type ProductionRun = (typeof productionRuns)[number];

export type WorkspaceContext = {
  workspaceId: string;
  userId: string;
  workspaceName: string;
  isDemo: boolean;
};

function claimText(claims: unknown, key: string): string | undefined {
  if (!claims || typeof claims !== "object") return undefined;
  const value = (claims as Record<string, unknown>)[key];
  return typeof value === "string" && value.trim() ? value : undefined;
}

export async function ensureWorkspace(req: Request): Promise<WorkspaceContext> {
  const auth = getAuth(req);
  const isDemo = !auth.userId;
  const userId = auth.userId ?? "demo-visitor";
  const workspaceId = isDemo ? "demo-workspace" : `user:${userId}`;
  const workspaceName = isDemo ? "Lakeview Specialty Foods — Demo" : "My Batchwise Workspace";
  const displayName =
    claimText(auth.sessionClaims, "name") ??
    claimText(auth.sessionClaims, "email") ??
    (isDemo ? "Demo visitor" : `Workspace owner · ${userId.slice(-8)}`);

  await db
    .insert(batchwiseWorkspacesTable)
    .values({
      id: workspaceId,
      name: workspaceName,
      ownerUserId: auth.userId ?? null,
    })
    .onConflictDoNothing();

  await db
    .insert(batchwiseUsersTable)
    .values({
      workspaceId,
      userId,
      displayName,
      role: isDemo ? "demo" : "owner",
      lastSeenAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [batchwiseUsersTable.workspaceId, batchwiseUsersTable.userId],
      set: { displayName, lastSeenAt: new Date() },
    });

  await db
    .insert(batchwiseRunsTable)
    .values(
      productionRuns.map((run) => ({
        workspaceId,
        id: run.id,
        payload: run,
      })),
    )
    .onConflictDoNothing();

  return { workspaceId, userId, workspaceName, isDemo };
}

export async function getWorkspaceRuns(workspaceId: string): Promise<ProductionRun[]> {
  const rows = await db
    .select({ payload: batchwiseRunsTable.payload })
    .from(batchwiseRunsTable)
    .where(eq(batchwiseRunsTable.workspaceId, workspaceId));

  return rows.map((row) => row.payload as ProductionRun);
}

export async function saveUpload(
  context: WorkspaceContext,
  input: { fileName: string; sizeBytes: number; rowCount: number },
  analysis: unknown,
) {
  const [record] = await db
    .insert(batchwiseUploadsTable)
    .values({
      workspaceId: context.workspaceId,
      userId: context.userId,
      fileName: input.fileName,
      sizeBytes: input.sizeBytes,
      rowCount: input.rowCount,
      analysis,
    })
    .returning();
  return record;
}

export async function saveQuestion(
  context: WorkspaceContext,
  question: string,
  answer: unknown,
) {
  await db.insert(batchwiseQuestionsTable).values({
    workspaceId: context.workspaceId,
    userId: context.userId,
    question,
    answer,
  });
}

export async function getUploads(workspaceId: string) {
  const rows = await db
    .select()
    .from(batchwiseUploadsTable)
    .where(eq(batchwiseUploadsTable.workspaceId, workspaceId))
    .orderBy(desc(batchwiseUploadsTable.createdAt))
    .limit(20);

  return rows.map((row) => {
    const analysis = row.analysis as { readinessScore?: number; status?: string };
    return {
      id: row.id,
      fileName: row.fileName,
      sizeBytes: row.sizeBytes,
      rowCount: row.rowCount,
      readinessScore: analysis.readinessScore ?? 0,
      status: analysis.status ?? "unknown",
      createdAt: row.createdAt.toISOString(),
    };
  });
}

export async function getLatestUploadAnalysis(workspaceId: string) {
  const rows = await db
    .select({ analysis: batchwiseUploadsTable.analysis })
    .from(batchwiseUploadsTable)
    .where(eq(batchwiseUploadsTable.workspaceId, workspaceId))
    .orderBy(desc(batchwiseUploadsTable.createdAt))
    .limit(1);
  return rows[0]?.analysis as
    | {
        status: "ready" | "ready-with-caveats" | "needs-review";
        readinessScore: number;
        issues: Array<{
          id: string;
          category: string;
          title: string;
          detail: string;
          severity: "critical" | "warning" | "info";
          affectedRows: number;
          affectedValue: number;
          status: "passed" | "review" | "blocked";
          owner: string;
        }>;
      }
    | undefined;
}

export async function getQuestionHistory(workspaceId: string) {
  const rows = await db
    .select()
    .from(batchwiseQuestionsTable)
    .where(eq(batchwiseQuestionsTable.workspaceId, workspaceId))
    .orderBy(desc(batchwiseQuestionsTable.createdAt))
    .limit(20);

  return rows.map((row) => {
    const answer = row.answer as { headline?: string; answer?: string };
    return {
      id: row.id,
      question: row.question,
      headline: answer.headline ?? "Saved answer",
      answer: answer.answer ?? "",
      createdAt: row.createdAt.toISOString(),
    };
  });
}

export async function getAdminOverview(context: WorkspaceContext) {
  const [users, uploads, questions, runCount, uploadCount, questionCount] =
    await Promise.all([
      db
        .select()
        .from(batchwiseUsersTable)
        .where(eq(batchwiseUsersTable.workspaceId, context.workspaceId))
        .orderBy(desc(batchwiseUsersTable.lastSeenAt)),
      db
        .select()
        .from(batchwiseUploadsTable)
        .where(eq(batchwiseUploadsTable.workspaceId, context.workspaceId))
        .orderBy(desc(batchwiseUploadsTable.createdAt))
        .limit(6),
      db
        .select()
        .from(batchwiseQuestionsTable)
        .where(eq(batchwiseQuestionsTable.workspaceId, context.workspaceId))
        .orderBy(desc(batchwiseQuestionsTable.createdAt))
        .limit(6),
      db
        .select({ value: count() })
        .from(batchwiseRunsTable)
        .where(eq(batchwiseRunsTable.workspaceId, context.workspaceId)),
      db
        .select({ value: count() })
        .from(batchwiseUploadsTable)
        .where(eq(batchwiseUploadsTable.workspaceId, context.workspaceId)),
      db
        .select({ value: count() })
        .from(batchwiseQuestionsTable)
        .where(eq(batchwiseQuestionsTable.workspaceId, context.workspaceId)),
    ]);

  const recentActivity = [
    ...uploads.map((upload) => ({
      type: "upload",
      label: "Dataset analyzed",
      detail: `${upload.fileName} · ${upload.rowCount.toLocaleString()} rows`,
      occurredAt: upload.createdAt.toISOString(),
    })),
    ...questions.map((question) => ({
      type: "question",
      label: "Copilot question",
      detail: question.question,
      occurredAt: question.createdAt.toISOString(),
    })),
  ]
    .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))
    .slice(0, 8);

  return {
    workspaceName: context.workspaceName,
    persistent: true,
    userCount: users.length,
    productionRunCount: runCount[0]?.value ?? 0,
    uploadCount: uploadCount[0]?.value ?? 0,
    questionCount: questionCount[0]?.value ?? 0,
    users: users.map((user) => ({
      userId: user.userId,
      displayName: user.displayName,
      role: user.role,
      lastSeenAt: user.lastSeenAt.toISOString(),
    })),
    recentActivity,
  };
}