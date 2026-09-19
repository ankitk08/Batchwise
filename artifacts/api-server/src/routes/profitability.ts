import { Router, type IRouter } from "express";
import {
  AnalyzeUploadBody,
  AnalyzeUploadResponse,
  AskQuestionBody,
  AskQuestionResponse,
  GetAdminOverviewResponse,
  GetDataQualityResponse,
  GetDashboardResponse,
  GetJobParams,
  GetJobResponse,
  GetJobsQueryParams,
  GetJobsResponse,
  GetKpisResponse,
  GetPrototypeProfileResponse,
  GetQuestionHistoryResponse,
  GetRecommendationsResponse,
  GetSemanticModelResponse,
  GetSourcesResponse,
  GetTeamResponse,
  GetUploadsResponse,
} from "@workspace/api-zod";
import {
  kpis,
  prototypeProfile,
  qualityChecks,
  recommendations,
  runWithEvidence,
  semanticModel,
  sources,
  team,
} from "../lib/food-prototype-data";
import {
  ensureWorkspace,
  getAdminOverview,
  getLatestUploadAnalysis,
  getQuestionHistory,
  getUploads,
  getWorkspaceRuns,
  saveQuestion,
  saveUpload,
} from "../lib/batchwise-store";

const router: IRouter = Router();

router.get("/dashboard", async (req, res): Promise<void> => {
  const context = await ensureWorkspace(req);
  const productionRuns = await getWorkspaceRuns(context.workspaceId);
  const closedJobs = productionRuns.filter((job) => job.status === "closed");
  const revenue = closedJobs.reduce((sum, job) => sum + job.revenue, 0);
  const contributionMargin = closedJobs.reduce(
    (sum, job) => sum + job.margin,
    0,
  );

  res.json(
    GetDashboardResponse.parse({
      period: "September 2026",
      revenue,
      contributionMargin,
      contributionMarginRate: Number(
        ((contributionMargin / revenue) * 100).toFixed(1),
      ),
      atRiskJobs: productionRuns.filter(
        (job) => job.status === "at-risk" || job.marginRate < 15,
      ).length,
      closedJobs: closedJobs.length,
      marginChange: -3.8,
      yieldRate: 91.8,
      wasteCost: 18420,
      scheduleAttainment: 87,
      ordersOnHold: 2,
      lastSyncedAt: new Date().toISOString(),
    }),
  );
});

router.get("/prototype-profile", (_req, res) => {
  res.json(GetPrototypeProfileResponse.parse(prototypeProfile));
});

router.post("/uploads/analyze", async (req, res): Promise<void> => {
  const parsed = AnalyzeUploadBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { fileName, rowCount, columns, sizeBytes } = parsed.data;
  const normalizedColumns = columns.map((column) => column.toLowerCase());
  const semanticFields = [
    ["run", "Production Run ID"],
    ["batch", "Production Run ID"],
    ["sku", "Product SKU"],
    ["product", "Product Name"],
    ["lot", "Ingredient Lot"],
    ["qty", "Actual Quantity"],
    ["quantity", "Actual Quantity"],
    ["cost", "Actual Cost"],
    ["hours", "Direct Labor Hours"],
    ["yield", "Good Yield"],
    ["hold", "Quality Hold"],
  ] as const;

  const mappings = columns.map((sourceColumn, index) => {
    const normalized = normalizedColumns[index] ?? "";
    const match = semanticFields.find(([keyword]) =>
      normalized.includes(keyword),
    );
    return {
      sourceColumn,
      semanticField: match?.[1] ?? "Unmapped business field",
      confidence: match ? 94 : 42,
      status: match ? "auto-mapped" : "review",
    };
  });
  const unmapped = mappings.filter((mapping) => mapping.status === "review");
  const issues = [
    ...(unmapped.length
      ? [
          {
            id: "upload-unmapped",
            category: "Semantic mapping",
            title: `${unmapped.length} columns require review`,
            detail:
              "These fields will not influence KPIs until a business owner approves their meaning.",
            severity: "warning",
            affectedRows: rowCount,
            affectedValue: 0,
            status: "review",
            owner: "Operations",
          },
        ]
      : []),
    {
      id: "upload-uom",
      category: "Units of measure",
      title: "Confirm pounds, cases, and eaches",
      detail:
        "The prototype detected quantity fields but unit conversions require approval before cost and yield calculations.",
      severity: "warning",
      affectedRows: Math.min(rowCount, 14),
      affectedValue: 4870,
      status: "review",
      owner: "Finance",
    },
  ];

  const context = await ensureWorkspace(req);
  const analysis = AnalyzeUploadResponse.parse({
      datasetName: fileName,
      inferredType: normalizedColumns.some((column) =>
        column.includes("lot"),
      )
        ? "Batch and ingredient consumption"
        : "Food manufacturing operating dataset",
      status: unmapped.length > Math.max(2, columns.length / 3)
        ? "needs-review"
        : "ready-with-caveats",
      rowCount,
      columnsDetected: columns.length,
      readinessScore: Math.max(48, 96 - unmapped.length * 8),
      mappings,
      issues,
      sizeBytes,
    });
  await saveUpload(context, { fileName, sizeBytes, rowCount }, analysis);
  res.json(analysis);
});

router.get("/uploads", async (req, res): Promise<void> => {
  const context = await ensureWorkspace(req);
  res.json(GetUploadsResponse.parse(await getUploads(context.workspaceId)));
});

router.get("/data-quality", async (req, res): Promise<void> => {
  const context = await ensureWorkspace(req);
  const latestUpload = await getLatestUploadAnalysis(context.workspaceId);
  const checks = latestUpload
    ? [...qualityChecks.filter((check) => check.status === "passed"), ...latestUpload.issues]
    : qualityChecks;
  res.json(
    GetDataQualityResponse.parse({
      readiness: latestUpload?.status === "needs-review"
        ? "blocked"
        : latestUpload?.status ?? "ready-with-caveats",
      overallScore: latestUpload?.readinessScore ?? 91,
      revenueCoverage: 99.4,
      costCoverage: latestUpload
        ? Math.max(50, latestUpload.readinessScore - 2.2)
        : 96.8,
      traceabilityCoverage: 100,
      blockedKpis: checks.some((check) => check.status === "blocked") ? 1 : 0,
      reviewItems: checks.filter((check) => check.status === "review").length,
      checks,
    }),
  );
});

router.get("/semantic-model", (_req, res) => {
  res.json(GetSemanticModelResponse.parse(semanticModel));
});

router.get("/kpis", (_req, res) => {
  res.json(GetKpisResponse.parse(kpis));
});

router.get("/recommendations", (_req, res) => {
  res.json(GetRecommendationsResponse.parse(recommendations));
});

router.get("/team", (_req, res) => {
  res.json(GetTeamResponse.parse(team));
});

router.get("/jobs", async (req, res): Promise<void> => {
  const parsed = GetJobsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { status = "all", search } = parsed.data;
  const context = await ensureWorkspace(req);
  const productionRuns = await getWorkspaceRuns(context.workspaceId);
  const normalizedSearch = search?.trim().toLowerCase();

  const matchingJobs = productionRuns.filter((job) => {
    const matchesStatus =
      status === "all" ||
      (status === "at-risk" &&
        (job.status === "at-risk" || job.marginRate < 15)) ||
      (status === "profitable" && job.marginRate >= 20) ||
      (status === "closed" && job.status === "closed");
    const matchesSearch =
      !normalizedSearch ||
      [
        job.jobNumber,
        job.customer,
        job.product,
        job.primaryLeak,
      ].some((value) => value.toLowerCase().includes(normalizedSearch));
    return matchesStatus && matchesSearch;
  });

  res.json(GetJobsResponse.parse(matchingJobs));
});

router.get("/jobs/:jobId", async (req, res): Promise<void> => {
  const params = GetJobParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const context = await ensureWorkspace(req);
  const productionRuns = await getWorkspaceRuns(context.workspaceId);
  const job = productionRuns.find(
    (candidate) => candidate.id === params.data.jobId,
  );
  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  res.json(GetJobResponse.parse(runWithEvidence(job)));
});

router.post("/questions/ask", async (req, res): Promise<void> => {
  const parsed = AskQuestionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const question = parsed.data.question.trim();
  const context = await ensureWorkspace(req);
  const productionRuns = await getWorkspaceRuns(context.workspaceId);
  const normalized = question.toLowerCase();
  const lowMarginJobs = productionRuns
    .filter((job) => job.status === "closed" && job.marginRate < 20)
    .sort((a, b) => a.marginRate - b.marginRate);
  const totalLeak = lowMarginJobs.reduce(
    (sum, job) => sum + Math.max(0, job.actualCost - job.estimatedCost),
    0,
  );
  const isCustomerQuestion = normalized.includes("customer");
  const isOpenRiskQuestion =
    normalized.includes("open") ||
    normalized.includes("risk") ||
    normalized.includes("overrun");

  const answerJobs = isOpenRiskQuestion
    ? productionRuns.filter((job) => job.status === "at-risk")
    : lowMarginJobs;

  const headline = isCustomerQuestion
    ? "Harvest Table Foods produced the weakest contribution margin."
    : isOpenRiskQuestion
      ? "One open production run has a material labor risk."
      : "Two closed production runs finished below the 20% margin threshold.";
  const answer = isCustomerQuestion
    ? "Harvest Table Foods' salsa run lost $1,640 after a quality hold, relabeling, and rework across two shifts. It is the only customer with a negative closed-run margin in the current period."
    : isOpenRiskQuestion
      ? "PR-240919-A for Regional Grocery Co-op accumulated 19 unplanned labor hours after filler downtime. Ingredients remain within standard, while final sanitation and conversion overhead are not yet posted."
      : "PR-240914-C lost money and PR-240916-B closed below the 20% target. The primary drivers were relabeling after a quality hold, tomato input price, and higher cook loss.";

  const response = AskQuestionResponse.parse({
      question,
      answer,
      headline,
      metric: isOpenRiskQuestion ? "Open jobs at risk" : "Cost above estimate",
      metricValue: isOpenRiskQuestion ? answerJobs.length : totalLeak,
      metricUnit: isOpenRiskQuestion ? "jobs" : "USD",
      asOf: new Date().toISOString(),
      confidence: "high",
      caveat:
        "Seven labor rows with unresolved employee aliases and two packaging unit conversions are excluded until approved.",
      evidence: [
        {
          label: "Revenue coverage",
          value: "100%",
          source: "ERP shipments + QuickBooks invoices",
          detail: "99.4% of included shipped value matches a posted invoice.",
        },
        {
          label: "Cost coverage",
          value: "96.8%",
          source: "ERP, quality, packaging, and labor files",
          detail: "Unresolved labor aliases and packaging UOM rows were excluded.",
        },
        {
          label: "Margin definition",
          value: "Batch contribution margin",
          source: "Metric contract v1.2",
          detail: "Revenue less ingredients, packaging, direct labor, and approved conversion overhead.",
        },
      ],
      jobs: answerJobs,
    });
  await saveQuestion(context, question, response);
  res.json(response);
});

router.get("/questions/history", async (req, res): Promise<void> => {
  const context = await ensureWorkspace(req);
  res.json(
    GetQuestionHistoryResponse.parse(
      await getQuestionHistory(context.workspaceId),
    ),
  );
});

router.get("/admin/overview", async (req, res): Promise<void> => {
  const context = await ensureWorkspace(req);
  res.json(GetAdminOverviewResponse.parse(await getAdminOverview(context)));
});

router.get("/sources", (_req, res) => {
  res.json(GetSourcesResponse.parse(sources));
});

export default router;