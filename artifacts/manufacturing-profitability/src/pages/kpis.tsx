import { useGetKpis } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { TrendingDown, TrendingUp, Minus, HelpCircle, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Kpis() {
  const { data: kpis, isLoading } = useGetKpis();

  if (isLoading) {
    return (
      <div className="p-6 max-w-[1400px] mx-auto space-y-8">
        <Skeleton className="h-10 w-1/4" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-64 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (!kpis) {
    return (
      <div className="p-8 text-center text-muted-foreground border rounded-xl border-dashed">
        Failed to load KPIs.
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">KPI Catalog</h1>
        <p className="text-muted-foreground mt-1">
          Governed operational and financial metrics.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {kpis.map(kpi => (
          <Card key={kpi.id} className={cn(
            "shadow-sm border-border/50 hover-elevate transition-all flex flex-col",
            kpi.status === 'off-track' ? "border-destructive/30" :
            kpi.status === 'watch' ? "border-amber-500/30" : ""
          )}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg font-bold">{kpi.name}</CardTitle>
                <Badge variant={
                  kpi.status === 'on-track' ? 'default' : 
                  kpi.status === 'watch' ? 'secondary' : 'destructive'
                } className={cn(
                  kpi.status === 'on-track' && "bg-emerald-500 hover:bg-emerald-600 text-white",
                  kpi.status === 'watch' && "bg-amber-500/20 text-amber-700 hover:bg-amber-500/30 border border-amber-500/20"
                )}>
                  {kpi.status.replace('-', ' ')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col pt-2">
              <div className="flex items-end gap-2 mb-4">
                <div className="text-3xl font-bold font-mono">
                  {kpi.unit === '$' ? '$' : ''}{kpi.value.toLocaleString()}{kpi.unit !== '$' ? kpi.unit : ''}
                </div>
                
                <div className={cn(
                  "flex items-center gap-1 text-sm font-medium mb-1",
                  kpi.direction === 'up' ? "text-emerald-500" :
                  kpi.direction === 'down' ? "text-destructive" : "text-muted-foreground"
                )}>
                  {kpi.direction === 'up' && <TrendingUp className="h-4 w-4" />}
                  {kpi.direction === 'down' && <TrendingDown className="h-4 w-4" />}
                  {kpi.direction === 'flat' && <Minus className="h-4 w-4" />}
                  {kpi.change > 0 ? '+' : ''}{kpi.change}%
                </div>
              </div>

              <div className="space-y-4 flex-1">
                <div className="flex justify-between text-sm py-2 border-y border-border/50">
                  <span className="text-muted-foreground">Target</span>
                  <span className="font-mono font-medium">
                    {kpi.unit === '$' ? '$' : ''}{kpi.target.toLocaleString()}{kpi.unit !== '$' ? kpi.unit : ''}
                  </span>
                </div>
                
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Definition</h4>
                  <p className="text-sm">{kpi.definition}</p>
                </div>
                
                <div className="bg-muted/40 p-3 rounded-md border mt-auto">
                  <h4 className="text-xs font-semibold flex items-center gap-1.5 text-primary mb-1">
                    <HelpCircle className="h-3.5 w-3.5" /> Core Question
                  </h4>
                  <p className="text-sm italic text-muted-foreground">"{kpi.businessQuestion}"</p>
                </div>
              </div>
              
              <div className="pt-4 mt-4 border-t border-border/50 text-xs text-muted-foreground flex items-center justify-between">
                <span>Owner: <strong className="text-foreground">{kpi.owner}</strong></span>
                <Activity className="h-3.5 w-3.5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}