import { useGetJob } from "@workspace/api-client-react"
import { useParams, Link } from "wouter"
import { formatCurrency, formatPercent, cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, Target, Wallet, AlertCircle, FileText, CheckCircle2, TrendingDown, ShieldCheck, Info, DatabaseZap } from "lucide-react"

export default function JobDetail() {
  const { id } = useParams<{ id: string }>()
  const { data: job, isLoading } = useGetJob(id as string)

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-24 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-64 col-span-2" />
          <Skeleton className="h-64" />
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-slate-900">Job not found</h2>
        <Link href="/jobs" className="text-indigo-600 hover:underline mt-4 inline-block">Return to Jobs</Link>
      </div>
    )
  }

  const isAtRisk = job.status === 'at-risk' || job.marginRate < 10

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="flex items-center gap-4 text-sm text-slate-500 mb-2">
        <Link href="/jobs" className="hover:text-slate-900 flex items-center transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> Jobs
        </Link>
        <span>/</span>
        <span className="font-mono">{job.jobNumber}</span>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">{job.customer}</h1>
            <Badge variant={job.status === 'at-risk' ? 'destructive' : job.status === 'closed' ? 'secondary' : 'success'} className="text-sm px-3">
              {job.status.toUpperCase()}
            </Badge>
          </div>
          <p className="text-lg text-slate-600">{job.product}</p>
          <div className="flex items-center gap-4 mt-4 text-sm text-slate-500">
            <span className="font-mono">Opened: {new Date(job.openedAt).toLocaleDateString()}</span>
            <span>•</span>
            <span className="font-mono">Due: {new Date(job.dueDate).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-lg px-6 py-4 flex gap-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Revenue</p>
            <p className="text-2xl font-bold font-mono text-slate-900">{formatCurrency(job.revenue)}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Margin</p>
            <p className={cn("text-2xl font-bold font-mono", job.margin < 0 ? "text-red-600" : "text-emerald-600")}>
              {formatCurrency(job.margin)}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Rate</p>
            <Badge variant="outline" className={cn("text-lg font-mono px-2", job.marginRate < 15 ? "bg-red-50 text-red-700 border-red-200" : "bg-emerald-50 text-emerald-700 border-emerald-200")}>
              {formatPercent(job.marginRate)}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Wallet className="w-5 h-5 mr-2 text-slate-400" /> Cost Breakdown
              </CardTitle>
            </CardHeader>
            <div className="px-6 pb-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-medium">
                      <th className="pb-3 pl-2">Category</th>
                      <th className="pb-3 text-right">Estimated</th>
                      <th className="pb-3 text-right">Actual</th>
                      <th className="pb-3 text-right">Variance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {job.costLines.map((line, i) => (
                      <tr key={i} className="hover:bg-slate-50 group">
                        <td className="py-4 pl-2">
                          <div className="font-medium text-slate-900 capitalize">{line.category}</div>
                          {line.note && <div className="text-xs text-slate-500 mt-1 max-w-[200px] truncate" title={line.note}>{line.note}</div>}
                        </td>
                        <td className="py-4 text-right font-mono text-slate-600">{formatCurrency(line.estimated)}</td>
                        <td className="py-4 text-right font-mono font-medium text-slate-900">{formatCurrency(line.actual)}</td>
                        <td className="py-4 text-right">
                          <span className={cn(
                            "font-mono px-2 py-1 rounded-md text-xs",
                            line.variance > 0 ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"
                          )}>
                            {line.variance > 0 ? '+' : ''}{formatCurrency(line.variance)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="border-t-2 border-slate-200 font-semibold bg-slate-50">
                    <tr>
                      <td className="py-4 pl-2">Total Costs</td>
                      <td className="py-4 text-right font-mono text-slate-600">{formatCurrency(job.estimatedCost)}</td>
                      <td className="py-4 text-right font-mono text-slate-900">{formatCurrency(job.actualCost)}</td>
                      <td className="py-4 text-right font-mono">
                        <span className={job.actualCost > job.estimatedCost ? "text-red-600" : "text-emerald-600"}>
                          {job.actualCost > job.estimatedCost ? '+' : ''}{formatCurrency(job.actualCost - job.estimatedCost)}
                        </span>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className={cn(
            "border",
            isAtRisk ? "border-red-200 bg-red-50/30" : "border-emerald-200 bg-emerald-50/30"
          )}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center">
                {isAtRisk ? (
                  <><AlertCircle className="w-5 h-5 mr-2 text-red-600" /> Margin Leak</>
                ) : (
                  <><CheckCircle2 className="w-5 h-5 mr-2 text-emerald-600" /> Healthy Job</>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isAtRisk ? (
                <>
                  <p className="text-sm text-slate-700 mb-4">
                    This job is performing below target margin. The primary driver is <strong className="font-semibold text-slate-900 capitalize">{job.primaryLeak}</strong>.
                  </p>
                  <div className="bg-white rounded border border-red-100 p-3 shadow-sm">
                    <div className="flex items-center text-xs font-semibold text-red-800 uppercase tracking-wider mb-2">
                      <TrendingDown className="w-3 h-3 mr-1" /> Confidence: {job.confidence}
                    </div>
                    <p className="text-xs text-slate-600">
                      Based on current connected sources, we have {job.confidence} confidence in this variance attribution.
                    </p>
                  </div>
                </>
              ) : (
                <p className="text-sm text-slate-700">
                  This job is tracking favorably against estimated costs. No significant leaks detected.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center">
                <ShieldCheck className="w-5 h-5 mr-2 text-slate-400" /> Source Evidence
              </CardTitle>
              <CardDescription>Line-item data verifying costs</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {job.evidence.map((item, idx) => (
                  <li key={idx} className="text-sm">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium text-slate-900">{item.label}</span>
                      <span className="font-mono text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded text-xs">{item.value}</span>
                    </div>
                    <div className="flex items-center text-xs text-slate-500 mb-1">
                      <DatabaseZap className="w-3 h-3 mr-1 opacity-70" /> {item.source}
                    </div>
                    <p className="text-xs text-slate-600 leading-snug">{item.detail}</p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
