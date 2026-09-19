import { useState } from "react"
import { useGetJobs } from "@workspace/api-client-react"
import { formatCurrency, formatPercent, cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, AlertCircle, ArrowRight } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Link, useLocation } from "wouter"

type JobStatus = 'all' | 'at-risk' | 'profitable' | 'closed';

export default function JobsList() {
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<JobStatus>('all')
  const [, setLocation] = useLocation()
  
  const { data: jobs, isLoading } = useGetJobs({ 
    search: search.length > 2 ? search : undefined, 
    status: status !== 'all' ? status : undefined 
  })

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Jobs</h1>
          <p className="text-slate-500 mt-2">Browse and monitor job profitability.</p>
        </div>
      </div>

      <Card className="p-4 border-slate-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search jobs, customers, products..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0">
            {(['all', 'at-risk', 'profitable', 'closed'] as const).map((s) => (
              <Button 
                key={s} 
                variant={status === s ? "default" : "outline"}
                onClick={() => setStatus(s)}
                className={cn("capitalize", status === s ? "bg-slate-900 text-white" : "text-slate-600")}
                size="sm"
              >
                {s.replace('-', ' ')}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      <Card className="border-slate-200 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead className="w-[120px]">Job No.</TableHead>
              <TableHead>Customer / Product</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Revenue</TableHead>
              <TableHead className="text-right">Margin</TableHead>
              <TableHead className="text-right">Rate</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-3 w-24" />
                  </TableCell>
                  <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                  <TableCell></TableCell>
                </TableRow>
              ))
            ) : jobs?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-slate-500">
                  No jobs found matching your criteria.
                </TableCell>
              </TableRow>
            ) : (
              jobs?.map((job) => (
                <TableRow 
                  key={job.id} 
                  className="cursor-pointer group hover:bg-slate-50"
                  onClick={() => setLocation(`/jobs/${job.id}`)}
                >
                  <TableCell className="font-semibold text-indigo-700">{job.jobNumber}</TableCell>
                  <TableCell>
                    <div className="font-medium text-slate-900">{job.customer}</div>
                    <div className="text-sm text-slate-500">{job.product}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={job.status === 'at-risk' ? 'destructive' : job.status === 'closed' ? 'secondary' : 'success'}>
                      {job.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono text-slate-900">{formatCurrency(job.revenue)}</TableCell>
                  <TableCell className="text-right">
                    <div className={cn("font-mono font-medium", job.margin < 0 ? "text-red-600" : "text-emerald-600")}>
                      {formatCurrency(job.margin)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="outline" className={cn("font-mono", job.marginRate < 15 ? "border-red-200 bg-red-50 text-red-700" : "bg-slate-50")}>
                      {formatPercent(job.marginRate)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
