import { useState } from "react"
import { useGetDashboard, useAskQuestion } from "@workspace/api-client-react"
import { formatCurrency, formatPercent } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Search, TrendingUp, AlertTriangle, CheckCircle2, ArrowUpRight, ArrowDownRight, Lightbulb, Link as LinkIcon, Sparkles } from "lucide-react"
import { Link } from "wouter"

export default function Dashboard() {
  const { data: dashboard, isLoading: isDashboardLoading } = useGetDashboard()
  const askQuestion = useAskQuestion()
  
  const [query, setQuery] = useState("")
  
  const handleAsk = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    askQuestion.mutate({ data: { question: query } })
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Profitability Cockpit</h1>
        <p className="text-slate-500 mt-2">Current period operating summary and insights.</p>
      </div>

      {isDashboardLoading ? (
        <div className="grid gap-4 md:grid-cols-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      ) : dashboard ? (
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="hover-elevate">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-slate-500">Revenue ({dashboard.period})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono text-slate-900">{formatCurrency(dashboard.revenue)}</div>
              <p className="text-xs text-slate-500 mt-1">Total closed & open jobs</p>
            </CardContent>
          </Card>
          <Card className="hover-elevate">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-slate-500">Margin</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline space-x-2">
                <div className="text-2xl font-bold font-mono text-slate-900">{formatCurrency(dashboard.contributionMargin)}</div>
                <div className={`flex items-center text-sm ${dashboard.marginChange >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                  {dashboard.marginChange >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  {formatPercent(Math.abs(dashboard.marginChange))}
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-1">Blended rate: {formatPercent(dashboard.contributionMarginRate)}</p>
            </CardContent>
          </Card>
          <Card className="hover-elevate">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-slate-500">At-Risk Jobs</CardTitle>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono text-slate-900">{dashboard.atRiskJobs}</div>
              <p className="text-xs text-slate-500 mt-1">Below margin threshold</p>
            </CardContent>
          </Card>
          <Card className="hover-elevate">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-slate-500">Closed</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono text-slate-900">{dashboard.closedJobs}</div>
              <p className="text-xs text-slate-500 mt-1">Jobs delivered this period</p>
            </CardContent>
          </Card>
        </div>
      ) : null}

      <div className="mt-12">
        <Card className="border-indigo-100 shadow-md">
          <CardContent className="p-6 md:p-8">
            <div className="flex items-center mb-6">
              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center mr-4">
                <Sparkles className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Ask the Controller</h3>
                <p className="text-sm text-slate-500">Query your operating data in plain English.</p>
              </div>
            </div>
            <form onSubmit={handleAsk} className="flex space-x-3 relative">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. Which jobs lost the most margin to overtime last month?" 
                  className="pl-10 h-12 text-base font-medium shadow-sm border-slate-200"
                />
              </div>
              <Button type="submit" disabled={askQuestion.isPending || !query.trim()} className="h-12 px-8 bg-indigo-600 hover:bg-indigo-700">
                {askQuestion.isPending ? "Analyzing..." : "Ask"}
              </Button>
            </form>

            {askQuestion.data && (
              <div className="mt-8 pt-8 border-t border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="text-2xl font-bold text-slate-900">{askQuestion.data.headline}</h4>
                  <Badge variant={askQuestion.data.confidence === "high" ? "success" : askQuestion.data.confidence === "medium" ? "warning" : "default"}>
                    {askQuestion.data.confidence} confidence
                  </Badge>
                </div>
                
                <div className="prose prose-slate max-w-none text-slate-700">
                  <p>{askQuestion.data.answer}</p>
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-4">
                  <div className="bg-slate-50 border border-slate-100 rounded-lg p-4 flex items-center flex-1 min-w-[250px]">
                    <div className="flex-1">
                      <p className="text-sm text-slate-500 font-medium uppercase tracking-wider">{askQuestion.data.metric}</p>
                      <div className="mt-1 flex items-baseline">
                        <span className="text-2xl font-bold font-mono text-slate-900">{askQuestion.data.metricValue}</span>
                        <span className="ml-2 text-sm text-slate-500 font-mono">{askQuestion.data.metricUnit}</span>
                      </div>
                    </div>
                  </div>
                  
                  {askQuestion.data.caveat && (
                    <div className="flex-1 min-w-[250px] p-4 bg-amber-50 text-amber-800 rounded-lg border border-amber-100 text-sm">
                      <strong className="block mb-1">Caveat</strong>
                      {askQuestion.data.caveat}
                    </div>
                  )}
                </div>

                {askQuestion.data.jobs && askQuestion.data.jobs.length > 0 && (
                  <div className="mt-8">
                    <h5 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-3">Implicated Jobs</h5>
                    <div className="grid gap-3 md:grid-cols-2">
                      {askQuestion.data.jobs.map(job => (
                        <Link key={job.id} href={`/jobs/${job.id}`} className="block group">
                          <div className="p-4 rounded-lg border border-slate-200 bg-white group-hover:border-indigo-300 group-hover:shadow-sm transition-all">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-semibold text-indigo-700">{job.jobNumber}</span>
                              <Badge variant={job.status === 'at-risk' ? 'destructive' : job.status === 'closed' ? 'secondary' : 'default'} className="text-[10px]">
                                {job.status}
                              </Badge>
                            </div>
                            <div className="text-sm text-slate-600 truncate">{job.customer} • {job.product}</div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
