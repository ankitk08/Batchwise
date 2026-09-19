import { useGetRecommendations } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ListTodo, CheckCircle2, ChevronRight, Activity, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Recommendations() {
  const { data: recommendations, isLoading } = useGetRecommendations();

  if (isLoading) {
    return (
      <div className="p-6 max-w-[1200px] mx-auto space-y-8">
        <Skeleton className="h-10 w-1/3" />
        <div className="space-y-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (!recommendations) {
    return (
      <div className="p-8 text-center text-muted-foreground border rounded-xl border-dashed">
        Failed to load recommendations.
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1200px] mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Recommendations</h1>
        <p className="text-muted-foreground mt-1">
          Prioritized, evidence-backed actions to improve manufacturing profitability.
        </p>
      </div>

      <div className="space-y-6">
        {recommendations.map((rec) => (
          <Card key={rec.id} className="shadow-sm border-border/50 hover-elevate transition-all overflow-hidden flex flex-col md:flex-row">
            <div className={cn(
              "w-2 md:w-3 shrink-0",
              rec.status === 'accepted' ? "bg-emerald-500" :
              rec.status === 'monitoring' ? "bg-amber-500" : "bg-primary"
            )} />
            
            <div className="flex-1 p-6">
              <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Badge variant={rec.status === 'proposed' ? 'default' : 'secondary'} className={cn(
                      rec.status === 'accepted' && "bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20",
                      rec.status === 'monitoring' && "bg-amber-500/10 text-amber-700 hover:bg-amber-500/20"
                    )}>
                      {rec.status.toUpperCase()}
                    </Badge>
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> {rec.horizon}
                    </span>
                  </div>
                  <CardTitle className="text-xl">{rec.title}</CardTitle>
                </div>
                
                <div className="flex gap-2">
                  <Badge variant="outline" className="bg-muted/50 font-mono text-xs">
                    Effort: {rec.effort}
                  </Badge>
                  <Badge variant="outline" className="bg-muted/50 font-mono text-xs">
                    Confidence: {rec.confidence}
                  </Badge>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-1">Finding</h4>
                    <p className="text-foreground text-sm leading-relaxed">{rec.finding}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-1">Rationale</h4>
                    <p className="text-muted-foreground text-sm leading-relaxed">{rec.rationale}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-primary/5 border border-primary/10 rounded-md p-4">
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-primary flex items-center gap-2 mb-2">
                      <Activity className="h-4 w-4" /> Expected Impact
                    </h4>
                    <p className="text-primary font-medium">{rec.expectedImpact}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Evidence</h4>
                    <ul className="space-y-1.5">
                      {rec.evidence.map((ev, i) => (
                        <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{ev}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Owner: <strong>{rec.owner}</strong></span>
                
                {rec.status === 'proposed' && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Dismiss</Button>
                    <Button size="sm">Accept Action <ChevronRight className="ml-1 h-4 w-4" /></Button>
                  </div>
                )}
                {rec.status === 'accepted' && (
                  <Button variant="outline" size="sm">Begin Monitoring</Button>
                )}
                {rec.status === 'monitoring' && (
                  <Button variant="ghost" size="sm" className="text-emerald-600">Resolve</Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}