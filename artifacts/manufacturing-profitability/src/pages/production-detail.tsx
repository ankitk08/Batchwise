import { useParams, Link } from "wouter";
import { useGetJob } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  ArrowLeft, 
  Factory, 
  AlertTriangle, 
  TrendingDown, 
  TrendingUp,
  FileText,
  Calendar,
  DollarSign
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function ProductionDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: job, isLoading } = useGetJob(id!);

  if (isLoading) {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-8">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-24 w-full" />
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-48 md:col-span-2" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="p-8 text-center text-muted-foreground border rounded-xl border-dashed">
        Job not found.
      </div>
    );
  }

  const isAtRisk = job.status === 'at-risk';
  const marginIsLow = job.marginRate < 20;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-4 -ml-3 text-muted-foreground">
          <Link href="/production"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Production Runs</Link>
        </Button>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Badge variant={isAtRisk ? 'destructive' : 'default'} className={cn(isAtRisk && "bg-destructive/10 text-destructive border-destructive/20")}>
                {job.status.toUpperCase()}
              </Badge>
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" /> Due {new Date(job.dueDate).toLocaleDateString()}
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              Job {job.jobNumber}
            </h1>
            <p className="text-xl text-muted-foreground mt-1">
              {job.product} <span className="mx-2 text-border">•</span> {job.customer}
            </p>
          </div>
          
          <div className="flex flex-col items-end text-right bg-card border shadow-sm rounded-lg p-4">
            <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Run Margin</span>
            <div className="flex items-center gap-3 mt-1">
              <span className={cn("text-3xl font-bold font-mono", marginIsLow ? "text-destructive" : "text-emerald-600")}>
                {job.marginRate.toFixed(1)}%
              </span>
              <div className="text-right">
                <div className="font-mono text-sm">${job.margin.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">on ${job.revenue.toLocaleString()} Rev</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2 shadow-sm border-border/50">
          <CardHeader className="bg-muted/20 border-b pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-muted-foreground" /> 
              Cost & Variance Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Est. Cost</TableHead>
                  <TableHead className="text-right">Actual Cost</TableHead>
                  <TableHead className="text-right">Variance</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {job.costLines.map((line, i) => {
                  const overBudget = line.variance > 0;
                  return (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{line.category}</TableCell>
                      <TableCell className="text-right font-mono">${line.estimated.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-mono">${line.actual.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <div className={cn(
                          "font-mono flex items-center justify-end gap-1",
                          overBudget ? "text-destructive" : "text-emerald-600"
                        )}>
                          {overBudget ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                          ${Math.abs(line.variance).toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px] text-muted-foreground">{line.source}</Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {job.primaryLeak && (
            <Card className="border-amber-500/30 shadow-sm bg-amber-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-amber-800 dark:text-amber-500 text-base flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" /> Primary Profit Leak
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">{job.primaryLeak}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  This variance is the primary driver of the reduced margin on this run.
                </p>
              </CardContent>
            </Card>
          )}

          <Card className="shadow-sm border-border/50">
            <CardHeader className="pb-3 bg-muted/20 border-b">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" /> Supporting Evidence
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {job.evidence.map((ev, i) => (
                <div key={i} className="space-y-1 border-l-2 border-primary/30 pl-3 py-1">
                  <div className="flex justify-between items-start">
                    <span className="font-medium text-sm">{ev.label}</span>
                    <Badge variant="secondary" className="text-[10px] bg-muted">{ev.source}</Badge>
                  </div>
                  <div className="font-mono text-primary font-semibold text-lg">{ev.value}</div>
                  <p className="text-xs text-muted-foreground">{ev.detail}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}