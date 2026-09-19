import { Router, type IRouter } from "express";
import {
  AskQuestionBody,
  AskQuestionResponse,
  GetDashboardResponse,
  GetJobParams,
  GetJobResponse,
  GetJobsQueryParams,
  GetJobsResponse,
  GetSourcesResponse,
} from "@workspace/api-zod";
import { jobs, sources, withEvidence } from "../lib/manufacturing-data";

const router: IRouter = Router();

router.get("/dashboard", (_req, res) => {
  const closedJobs = jobs.filter((job) => job.status === "closed");
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
      atRiskJobs: jobs.filter(
        (job) => job.status === "at-risk" || job.marginRate < 15,
      ).length,
      closedJobs: closedJobs.length,
      marginChange: -3.8,
      lastSyncedAt: "2026-09-19T08:42:00.000Z",
    }),
  );
});

router.get("/jobs", (req, res) => {
  const parsed = GetJobsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { status = "all", search } = parsed.data;
  const normalizedSearch = search?.trim().toLowerCase();

  const matchingJobs = jobs.filter((job) => {
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

router.get("/jobs/:jobId", (req, res) => {
  const params = GetJobParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const job = jobs.find((candidate) => candidate.id === params.data.jobId);
  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  res.json(GetJobResponse.parse(withEvidence(job)));
});

router.post("/questions/ask", (req, res) => {
  const parsed = AskQuestionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const question = parsed.data.question.trim();
  const normalized = question.toLowerCase();
  const lowMarginJobs = jobs
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
    ? jobs.filter((job) => job.status === "at-risk")
    : lowMarginJobs;

  const headline = isCustomerQuestion
    ? "Apex Motion produced the weakest contribution margin."
    : isOpenRiskQuestion
      ? "One open job is currently trending below its estimate."
      : "Three closed jobs finished below the 20% margin threshold.";
  const answer = isCustomerQuestion
    ? "Apex Motion's J-1051 lost $2,220 after rework, repeat machining, and unquoted outside processing. It is the only customer with a negative closed-job margin in the current period."
    : isOpenRiskQuestion
      ? "J-1057 for Orion Packaging has consumed 132% of routed labor hours. Material and outside processing remain near plan, making labor the primary risk."
      : "J-1051 lost money, while J-1046 and J-1048 closed below the 20% target. Across the three jobs, actual cost exceeded estimate by $31,740, led by rework labor, replacement material, and supplier price variance.";

  res.json(
    AskQuestionResponse.parse({
      question,
      answer,
      headline,
      metric: isOpenRiskQuestion ? "Open jobs at risk" : "Cost above estimate",
      metricValue: isOpenRiskQuestion ? answerJobs.length : totalLeak,
      metricUnit: isOpenRiskQuestion ? "jobs" : "USD",
      asOf: "2026-09-19T08:42:00.000Z",
      confidence: "high",
      caveat:
        "Three labor rows with unresolved employee aliases were excluded from all calculations.",
      evidence: [
        {
          label: "Revenue coverage",
          value: "100%",
          source: "QuickBooks invoices",
          detail: "All included closed jobs matched to a posted invoice.",
        },
        {
          label: "Cost coverage",
          value: "98.7%",
          source: "ERP, labor workbook, vendor bills",
          detail: "Only unresolved labor aliases were excluded.",
        },
        {
          label: "Margin definition",
          value: "Contribution margin",
          source: "Approved costing policy",
          detail: "Revenue less actual material, labor, outside processing, and applied overhead.",
        },
      ],
      jobs: answerJobs,
    }),
  );
});

router.get("/sources", (_req, res) => {
  res.json(GetSourcesResponse.parse(sources));
});

export default router;