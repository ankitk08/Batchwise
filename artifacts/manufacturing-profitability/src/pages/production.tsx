import { useState } from "react";
import { useGetJobs } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Link } from "wouter";
import { Search, Filter, Factory, AlertTriangle, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GetJobsStatus } from "@workspace/api-client-react";

export default function Production() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<GetJobsStatus>('all');
  
  const { data: jobs, isLoading } = useGetJobs({
    search: search || undefined,
    status: status === 'all' ? undefined : status,
  });

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Production Runs</h1>
          <p className="text-muted-foreground mt-1">
            Manufacturing jobs and variance tracking.
          </p>
        </div>
      </div>

      <Card className="shadow-sm border-border/50">
        <div className="p-4 border-b flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by job number, product, or customer..." 
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={status} onValueChange={(val: GetJobsStatus) => setStatus(val)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Jobs</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="at-risk">At Risk</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="profitable">Profitable</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 space-y-4">
              {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : !jobs || jobs.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <Factory className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
              <p>No production runs found matching the criteria.</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="w-[120px]">Job Number</TableHead>
                  <TableHead>Product / Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead className="text-right">Margin</TableHead>
                  <TableHead>Primary Leak</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.map((job) => (
                  <TableRow key={job.id} className="hover:bg-muted/20">
                    <TableCell className="font-mono font-medium">
                      <Link href={`/production/${job.id}`} className="text-primary hover:underline">
                        {job.jobNumber}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{job.product}</div>
                      <div className="text-xs text-muted-foreground">{job.customer}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        job.status === 'closed' ? 'outline' : 
                        job.status === 'at-risk' ? 'destructive' : 'default'
                      } className={cn(
                        job.status === 'at-risk' && "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20"
                      )}>
                        {job.status.replace('-', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      ${job.revenue.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className={cn("font-mono font-bold", job.marginRate < 0.2 ? "text-destructive" : "text-emerald-600")}>
                        {job.marginRate > 0 ? '+' : ''}{(job.marginRate * 100).toFixed(1)}%
                      </div>
                      <div className="text-xs text-muted-foreground font-mono">
                        ${job.margin.toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      {job.primaryLeak ? (
                        <div className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-500 bg-amber-500/10 px-2 py-1 rounded-md max-w-fit">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          {job.primaryLeak}
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-500">
                          <ShieldCheck className="h-3.5 w-3.5" />
                          On Target
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/production/${job.id}`}>Details</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}