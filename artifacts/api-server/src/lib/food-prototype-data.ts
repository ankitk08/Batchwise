export const productionRuns = [
  {
    id: "run-240917-a",
    jobNumber: "PR-240917-A",
    customer: "Regional Grocery Co-op",
    product: "Roasted Red Pepper Hummus 10 oz",
    status: "closed",
    dueDate: "2026-09-17",
    openedAt: "2026-09-17",
    customerId: "cust-regional-grocery",
    revenue: 68400,
    estimatedCost: 48100,
    actualCost: 53520,
    margin: 14880,
    marginRate: 21.8,
    primaryLeak: "Yield loss during filling",
    confidence: "high",
    costLines: [
      { category: "Ingredients", estimated: 22100, actual: 23840, variance: 1740, source: "ERP batch issues", note: "Pepper and tahini usage exceeded standard by 3.2%." },
      { category: "Packaging", estimated: 9400, actual: 10680, variance: 1280, source: "Packaging consumption", note: "Cup and lid scrap increased after two line restarts." },
      { category: "Direct labor", estimated: 7600, actual: 9180, variance: 1580, source: "Labor workbook", note: "Changeover and restart labor exceeded the routing standard." },
      { category: "Conversion overhead", estimated: 9000, actual: 9820, variance: 820, source: "Approved costing policy", note: "Extra filler hours increased applied conversion cost." },
    ],
  },
  {
    id: "run-240916-b",
    jobNumber: "PR-240916-B",
    customer: "FreshMart Private Label",
    product: "Organic Tomato Basil Sauce 24 oz",
    status: "closed",
    dueDate: "2026-09-16",
    openedAt: "2026-09-15",
    customerId: "cust-freshmart",
    revenue: 91200,
    estimatedCost: 65800,
    actualCost: 74210,
    margin: 16990,
    marginRate: 18.6,
    primaryLeak: "Tomato input price and cook loss",
    confidence: "high",
    costLines: [
      { category: "Ingredients", estimated: 33400, actual: 38960, variance: 5560, source: "Purchasing + ERP batch issues", note: "Spot tomato pricing and higher evaporation increased cost." },
      { category: "Packaging", estimated: 14200, actual: 14710, variance: 510, source: "Packaging consumption", note: "Glass and closure usage remained near standard." },
      { category: "Direct labor", estimated: 8200, actual: 9250, variance: 1050, source: "Labor workbook", note: "Cook cycle required one additional operator shift." },
      { category: "Conversion overhead", estimated: 10000, actual: 11290, variance: 1290, source: "Approved costing policy", note: "Longer cook and sanitation time increased conversion cost." },
    ],
  },
  {
    id: "run-240914-c",
    jobNumber: "PR-240914-C",
    customer: "Harvest Table Foods",
    product: "Black Bean & Corn Salsa 16 oz",
    status: "closed",
    dueDate: "2026-09-14",
    openedAt: "2026-09-13",
    customerId: "cust-harvest-table",
    revenue: 49600,
    estimatedCost: 34600,
    actualCost: 51240,
    margin: -1640,
    marginRate: -3.3,
    primaryLeak: "Quality hold and relabeling",
    confidence: "high",
    costLines: [
      { category: "Ingredients", estimated: 15400, actual: 17280, variance: 1880, source: "ERP batch issues", note: "Additional ingredients used during blend correction." },
      { category: "Packaging", estimated: 8600, actual: 14260, variance: 5660, source: "Packaging consumption", note: "Labels were destroyed and reapplied after allergen declaration review." },
      { category: "Direct labor", estimated: 6200, actual: 11200, variance: 5000, source: "Labor workbook", note: "Product was held, inspected, and relabeled across two shifts." },
      { category: "Conversion overhead", estimated: 4400, actual: 8500, variance: 4100, source: "Approved costing policy", note: "Hold time and rework occupied finished-goods space and labor." },
    ],
  },
  {
    id: "run-240919-a",
    jobNumber: "PR-240919-A",
    customer: "Regional Grocery Co-op",
    product: "Classic Hummus 10 oz",
    status: "at-risk",
    dueDate: "2026-09-20",
    openedAt: "2026-09-19",
    customerId: "cust-regional-grocery",
    revenue: 57800,
    estimatedCost: 39100,
    actualCost: 37460,
    margin: 20340,
    marginRate: 35.2,
    primaryLeak: "Filler downtime and open sanitation",
    confidence: "medium",
    costLines: [
      { category: "Ingredients", estimated: 18200, actual: 17940, variance: -260, source: "ERP batch issues", note: "Ingredient usage is within standard." },
      { category: "Packaging", estimated: 7900, actual: 8140, variance: 240, source: "Packaging consumption", note: "Packaging consumption is slightly above standard." },
      { category: "Direct labor", estimated: 6400, actual: 7630, variance: 1230, source: "Labor workbook", note: "Unplanned filler downtime added 19 labor hours." },
      { category: "Conversion overhead", estimated: 6600, actual: 3750, variance: -2850, source: "Approved costing policy", note: "Run remains open; sanitation and final overhead are not posted." },
    ],
  },
  {
    id: "run-240918-d",
    jobNumber: "PR-240918-D",
    customer: "GoodLife Club Stores",
    product: "Mango Habanero Salsa 32 oz",
    status: "open",
    dueDate: "2026-09-23",
    openedAt: "2026-09-18",
    customerId: "cust-goodlife",
    revenue: 104600,
    estimatedCost: 71400,
    actualCost: 42800,
    margin: 61800,
    marginRate: 59.1,
    primaryLeak: "No current exception",
    confidence: "medium",
    costLines: [
      { category: "Ingredients", estimated: 34800, actual: 28600, variance: -6200, source: "ERP batch issues", note: "First two kettles completed within yield standard." },
      { category: "Packaging", estimated: 16100, actual: 9200, variance: -6900, source: "Packaging consumption", note: "Run is 58% complete." },
      { category: "Direct labor", estimated: 9800, actual: 5000, variance: -4800, source: "Labor workbook", note: "Labor is tracking near plan at current completion." },
      { category: "Conversion overhead", estimated: 10700, actual: 0, variance: -10700, source: "Approved costing policy", note: "Conversion overhead posts at run close." },
    ],
  },
] as const;

export const runWithEvidence = (run: (typeof productionRuns)[number]) => ({
  ...run,
  evidence: [
    { label: "Recognized revenue", value: `$${run.revenue.toLocaleString("en-US")}`, source: "ERP shipment + invoice export", detail: `Matched to ${run.jobNumber} and customer purchase order.` },
    { label: "Actual conversion cost", value: `$${run.actualCost.toLocaleString("en-US")}`, source: "Batch issues + packaging + labor", detail: "Ingredient, packaging, direct labor, and approved conversion overhead included." },
    { label: "Contribution margin", value: `${run.marginRate.toFixed(1)}%`, source: "Metric contract v1.2", detail: "Revenue less actual variable and applied conversion costs; freight excluded." },
  ],
});

export const prototypeProfile = {
  productName: "Batchwise Decision Intelligence",
  workspaceName: "Lakeview Specialty Foods",
  icp: [
    "US specialty food processor with 25–250 employees and $5M–$75M annual revenue",
    "One to three plants producing sauces, dips, prepared foods, bakery, beverages, or private-label products",
    "QuickBooks or a mid-market ERP plus production, quality, and labor spreadsheets",
    "Owner, controller, and operations leader lack a dedicated data engineering team",
  ],
  assumptions: [
    "The first deployment is read-only and begins with recurring CSV/XLSX exports.",
    "The first decision is which production runs, SKUs, and customers are eroding contribution margin.",
    "Food safety records remain systems of record; this product analyzes performance and does not replace HACCP or QMS workflows.",
    "Finance approves margin definitions, operations approves production mappings, and quality approves hold/scrap classifications.",
    "Customer workspaces use authenticated access; this prototype exposes a seeded demo workspace.",
  ],
  firstDecision: "Which production runs lost margin, what caused the loss, and which corrective actions should be prioritized this week?",
  updateCadence: "Daily incremental refresh with a Monday operating review and monthly profitability review.",
  prototypeLimits: [
    "CSV files are profiled in-browser; XLSX uploads use metadata until workbook parsing is connected.",
    "Recommendations are evidence-backed hypotheses, not food-safety or regulatory determinations.",
    "ERP, QuickBooks, and QMS connectors are represented by governed source states rather than live customer credentials.",
  ],
} as const;

export const qualityChecks = [
  { id: "dq-1", category: "Traceability", title: "Lot-to-run mapping is complete", detail: "All ingredient issues in the current period resolve to a production run and lot.", severity: "info", affectedRows: 0, affectedValue: 0, status: "passed", owner: "Quality" },
  { id: "dq-2", category: "Labor", title: "Three employee aliases need review", detail: "18.5 labor hours are excluded until spreadsheet aliases are linked to ERP employee IDs.", severity: "warning", affectedRows: 7, affectedValue: 812, status: "review", owner: "Operations" },
  { id: "dq-3", category: "Packaging", title: "Packaging UOM mismatch", detail: "Two cup items arrive as cases but standards are stored as eaches. Conversion was suggested but not approved.", severity: "critical", affectedRows: 14, affectedValue: 4870, status: "blocked", owner: "Finance" },
  { id: "dq-4", category: "Revenue", title: "Invoices reconcile to shipments", detail: "99.4% of shipped value is matched to posted invoices; one credit memo remains open.", severity: "info", affectedRows: 1, affectedValue: 1260, status: "passed", owner: "Finance" },
] as const;

export const semanticModel = {
  version: "Food Processing v1.2",
  approvedAt: "2026-09-16T15:30:00.000Z",
  entities: [
    { name: "Production Run", description: "A scheduled manufacturing run or batch for one SKU and formula version.", source: "ERP production orders", confidence: 99, status: "approved" },
    { name: "Formula & BOM", description: "Approved ingredient and packaging standards with expected yield.", source: "ERP formulas", confidence: 97, status: "approved" },
    { name: "Ingredient Lot", description: "Received ingredient lot consumed by a production run.", source: "ERP lot transactions", confidence: 99, status: "approved" },
    { name: "Quality Event", description: "Hold, release, scrap, rework, or inspection event associated with product.", source: "Quality workbook", confidence: 88, status: "review" },
    { name: "Customer Shipment", description: "Finished goods shipment connected to run, customer, and invoice.", source: "ERP + QuickBooks", confidence: 96, status: "approved" },
  ],
  relationships: [
    { from: "Formula & BOM", to: "Production Run", label: "governs expected inputs and yield" },
    { from: "Ingredient Lot", to: "Production Run", label: "is consumed by" },
    { from: "Quality Event", to: "Production Run", label: "holds, releases, or reworks" },
    { from: "Production Run", to: "Customer Shipment", label: "fulfills" },
  ],
  metrics: [
    { name: "Batch Contribution Margin", formula: "Recognized revenue − ingredients − packaging − direct labor − applied conversion overhead", businessDefinition: "Operational contribution after actual production cost; outbound freight and SG&A excluded.", owner: "Controller", status: "approved" },
    { name: "Good Yield", formula: "Good finished pounds ÷ total input pounds", businessDefinition: "Saleable finished product as a percentage of total ingredient input.", owner: "Plant Manager", status: "approved" },
    { name: "Cost of Quality Loss", formula: "Scrap + rework labor + relabeling + disposal + quality-hold carrying cost", businessDefinition: "Direct cost attributable to quality events; recall exposure excluded.", owner: "Quality Manager", status: "review" },
  ],
} as const;

export const kpis = [
  { id: "kpi-margin", name: "Batch contribution margin", value: 16.1, unit: "%", target: 22, direction: "down", change: -3.8, status: "off-track", definition: "Revenue less ingredients, packaging, direct labor, and conversion overhead.", businessQuestion: "Are production economics protecting the price we quoted?", owner: "Controller" },
  { id: "kpi-yield", name: "Good yield", value: 91.8, unit: "%", target: 94.5, direction: "down", change: -1.6, status: "off-track", definition: "Good finished pounds divided by total ingredient input pounds.", businessQuestion: "How much input becomes saleable product?", owner: "Plant Manager" },
  { id: "kpi-waste", name: "Waste cost", value: 18420, unit: "USD", target: 12000, direction: "up", change: 21.4, status: "off-track", definition: "Scrap, rework, relabeling, disposal, and approved quality-loss costs.", businessQuestion: "What did avoidable loss cost this period?", owner: "Quality Manager" },
  { id: "kpi-attainment", name: "Schedule attainment", value: 87, unit: "%", target: 95, direction: "flat", change: 0.4, status: "watch", definition: "Runs completed on their scheduled production date.", businessQuestion: "Are we producing to the weekly plan?", owner: "Production Planner" },
  { id: "kpi-otd", name: "On-time customer delivery", value: 96.2, unit: "%", target: 97, direction: "up", change: 1.1, status: "on-track", definition: "Customer shipments delivered on or before the committed date.", businessQuestion: "Are plant issues reaching the customer?", owner: "Customer Operations" },
  { id: "kpi-changeover", name: "Average changeover", value: 74, unit: "min", target: 60, direction: "down", change: 8.8, status: "watch", definition: "Elapsed time from last good unit of the prior run to first good unit of the next.", businessQuestion: "How much capacity is lost between products?", owner: "Operations" },
] as const;

export const recommendations = [
  { id: "rec-1", title: "Add a pre-run packaging verification gate", finding: "The salsa relabeling event generated $9,760 of direct packaging and labor variance.", rationale: "The approved allergen declaration and the printed label were not compared before the run was released.", expectedImpact: "$28k–$42k annual quality-loss avoidance", effort: "low", confidence: "high", owner: "Quality Manager", horizon: "Implement within 14 days", status: "proposed", evidence: ["PR-240914-C relabeling variance", "Quality hold QH-882", "14,400 labels destroyed"] },
  { id: "rec-2", title: "Reset tomato sauce yield and price standards", finding: "Tomato input price and cook loss reduced margin by 5.7 points on the latest private-label run.", rationale: "The standard formula uses the prior-season tomato price and a lower evaporation assumption.", expectedImpact: "$52k–$78k annual margin protection", effort: "medium", confidence: "high", owner: "Controller", horizon: "Before next customer quote", status: "accepted", evidence: ["PR-240916-B ingredient variance", "Current purchase receipts", "Three-run cook-yield trend"] },
  { id: "rec-3", title: "Run an SMED review on the filler changeover", finding: "Hummus filler downtime added 19 labor hours and placed the open run at risk.", rationale: "The same nozzle and sanitation sequence has exceeded standard in four of the last six changeovers.", expectedImpact: "Recover 6–10 production hours per month", effort: "medium", confidence: "medium", owner: "Plant Manager", horizon: "Pilot next week", status: "monitoring", evidence: ["PR-240919-A labor entries", "Six-run changeover history", "Downtime reason codes"] },
] as const;

export const team = [
  { id: "tm-1", name: "Maya Chen", email: "maya@lakeviewspecialty.com", role: "Owner / Admin", scope: "All plants and financials", approvals: ["Workspace", "Users", "KPI targets"], status: "active" },
  { id: "tm-2", name: "Luis Ramirez", email: "luis@lakeviewspecialty.com", role: "Plant Manager", scope: "Chicago plant", approvals: ["Production mappings", "Labor standards"], status: "active" },
  { id: "tm-3", name: "Erin Walsh", email: "erin@lakeviewspecialty.com", role: "Controller", scope: "All financial entities", approvals: ["Cost policy", "Margin definitions"], status: "active" },
  { id: "tm-4", name: "Tanya Brooks", email: "tanya@lakeviewspecialty.com", role: "Quality Manager", scope: "Quality and traceability", approvals: ["Hold taxonomy", "Quality loss"], status: "active" },
  { id: "tm-5", name: "Sam Patel", email: "sam@lakeviewspecialty.com", role: "Operations Analyst", scope: "Read and investigate", approvals: [], status: "invited" },
] as const;

export const sources = [
  { id: "src-erp", name: "Food ERP daily export", type: "ERP", status: "connected", recordCount: 8421, lastSyncedAt: "2026-09-19T08:39:00.000Z", detail: "Production orders, formulas, lot issues, inventory, shipments, and customers." },
  { id: "src-qbo", name: "QuickBooks Online", type: "Accounting", status: "connected", recordCount: 2368, lastSyncedAt: "2026-09-19T08:42:00.000Z", detail: "Invoices, credits, vendor bills, customers, and general ledger detail." },
  { id: "src-quality", name: "Quality & Holds.xlsx", type: "Spreadsheet", status: "needs-review", recordCount: 462, lastSyncedAt: "2026-09-19T07:55:00.000Z", detail: "Two hold-reason labels need semantic approval before quality-loss KPIs refresh." },
] as const;