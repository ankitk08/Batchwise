import { useGetDataQuality } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { AlertTriangle, CheckCircle2, ShieldAlert, ArrowRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DataQuality() {
  const { data: quality, isLoading } = useGetDataQuality();

  if (isLoading) {
    return (
      <div className="p-6 max-w-6xl mx-auto space-y-8">
        <Skeleton className="h-10 w-1/3" />
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  if (!quality) {
    return (
      <div className="p-8 text-center text-muted-foreground border rounded-xl border-dashed">
        Failed to load data quality summary.
      </div>
    );
  }

  const isReady = quality.readiness === 'ready' || quality.readiness === 'ready-with-caveats';

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Data Quality & Readiness</h1>
          <p className="text-muted-foreground mt-1">
            Governance gates before metric calculation and modeling.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link href="/onboarding">Upload New Source</Link>
          </Button>
          <Button asChild disabled={!isReady}>
            <Link href="/model">Proceed to Semantic Model <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        <Card className="md:col-span-4 border-l-4 border-l-primary shadow-sm bg-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Overall Readiness</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="text-5xl font-bold font-mono text-primary">{quality.overallScore}%</div>
              <div>
                {quality.readiness === 'ready' && <Badge className="bg-emerald-500 hover:bg-emerald-600">Ready</Badge>}
                {quality.readiness === 'ready-with-caveats' && <Badge variant="secondary" className="bg-amber-500/20 text-amber-700 hover:bg-amber-500/30">Ready with Caveats</Badge>}
                {quality.readiness === 'blocked' && <Badge variant="destructive">Blocked</Badge>}
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              {quality.blockedKpis} KPIs are currently blocked due to missing or invalid data.
            </p>
          </CardContent>
        </Card>

        <Card className="md:col-span-8 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Coverage Dimensions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Revenue Coverage</span>
                <span className="font-mono text-muted-foreground">{quality.revenueCoverage}%</span>
              </div>
              <Progress value={quality.revenueCoverage} className="h-2 bg-muted/50" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Cost Coverage</span>
                <span className="font-mono text-muted-foreground">{quality.costCoverage}%</span>
              </div>
              <Progress value={quality.costCoverage} className="h-2 bg-muted/50" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Traceability Coverage</span>
                <span className="font-mono text-muted-foreground">{quality.traceabilityCoverage}%</span>
              </div>
              <Progress value={quality.traceabilityCoverage} className="h-2 bg-muted/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-4">
          <ShieldAlert className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-xl font-semibold">Quality Checks ({quality.checks.length})</h2>
          {quality.reviewItems > 0 && (
            <Badge variant="secondary" className="ml-2 bg-amber-500/10 text-amber-700 border border-amber-500/20">
              {quality.reviewItems} require review
            </Badge>
          )}
        </div>

        <div className="space-y-4">
          {quality.checks.map(check => (
            <Card key={check.id} className={cn(
              "shadow-sm transition-all",
              check.status === 'blocked' ? "border-destructive/50 bg-destructive/5" :
              check.status === 'review' ? "border-amber-500/50 bg-amber-500/5" : "border-border/50"
            )}>
              <div className="p-5 flex flex-col md:flex-row md:items-center gap-6">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    {check.status === 'passed' && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                    {check.status === 'review' && <AlertTriangle className="h-4 w-4 text-amber-500" />}
                    {check.status === 'blocked' && <ShieldAlert className="h-4 w-4 text-destructive" />}
                    
                    <span className="font-semibold">{check.title}</span>
                    <Badge variant="outline" className="text-[10px] uppercase tracking-wider py-0 ml-2">
                      {check.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground pl-6">
                    {check.detail}
                  </p>
                </div>
                
                <div className="flex items-center gap-8 pl-6 md:pl-0">
                  <div className="text-sm">
                    <p className="text-muted-foreground text-xs uppercase tracking-wider">Affected</p>
                    <p className="font-medium font-mono">{check.affectedRows.toLocaleString()} rows</p>
                  </div>
                  <div className="text-sm">
                    <p className="text-muted-foreground text-xs uppercase tracking-wider">Value Impact</p>
                    <p className="font-medium font-mono">${(check.affectedValue / 1000).toFixed(1)}k</p>
                  </div>
                  <div className="text-sm">
                    <p className="text-muted-foreground text-xs uppercase tracking-wider">Owner</p>
                    <p className="font-medium">{check.owner}</p>
                  </div>
                  
                  <Button variant={check.status === 'passed' ? 'ghost' : 'outline'} size="sm" className="shrink-0 gap-1">
                    {check.status === 'passed' ? 'View Logs' : 'Resolve'} 
                    {check.status !== 'passed' && <ArrowUpRight className="h-3 w-3" />}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}