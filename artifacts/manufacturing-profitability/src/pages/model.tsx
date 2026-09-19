import { useGetSemanticModel } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database, Network, Calculator, FileText, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Model() {
  const { data: model, isLoading } = useGetSemanticModel();

  if (isLoading) {
    return (
      <div className="p-6 max-w-[1400px] mx-auto space-y-8">
        <Skeleton className="h-10 w-1/4" />
        <Skeleton className="h-12 w-full max-w-md" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!model) {
    return (
      <div className="p-8 text-center text-muted-foreground border rounded-xl border-dashed">
        Failed to load semantic model.
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Semantic Model</h1>
          <p className="text-muted-foreground mt-1">
            Governed definitions, entities, and relationships for the data model.
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <Badge variant="outline" className="px-3 py-1 font-mono bg-muted/50">v{model.version}</Badge>
          <span className="text-muted-foreground">Approved: {new Date(model.approvedAt).toLocaleDateString()}</span>
        </div>
      </div>

      <Tabs defaultValue="entities" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="entities"><Database className="h-4 w-4 mr-2" /> Entities</TabsTrigger>
          <TabsTrigger value="relationships"><Network className="h-4 w-4 mr-2" /> Graph</TabsTrigger>
          <TabsTrigger value="metrics"><Calculator className="h-4 w-4 mr-2" /> Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="entities" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {model.entities.map(entity => (
              <Card key={entity.name} className="shadow-sm border-border/50 hover-elevate transition-all">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-bold font-mono text-primary flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      {entity.name}
                    </CardTitle>
                    <Badge variant={entity.status === 'approved' ? 'default' : entity.status === 'review' ? 'secondary' : 'outline'}
                           className={cn(entity.status === 'review' && "bg-amber-500/10 text-amber-700 border-amber-500/20")}>
                      {entity.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{entity.description}</p>
                  
                  <div className="flex justify-between items-center text-sm pt-4 border-t border-border/50">
                    <div className="space-y-0.5">
                      <span className="text-xs uppercase tracking-wider text-muted-foreground">Source</span>
                      <p className="font-medium">{entity.source}</p>
                    </div>
                    <div className="space-y-0.5 text-right">
                      <span className="text-xs uppercase tracking-wider text-muted-foreground">Confidence</span>
                      <p className="font-medium font-mono">{entity.confidence}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="relationships" className="mt-6">
          <Card className="border-border/50 shadow-sm min-h-[500px] flex items-center justify-center bg-muted/10 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+CjxjaXJjbGUgY3g9IjIiIGN5PSIyIiByPSIxIiBmaWxsPSJyZ2JhKDE1LCAyMywgNDIsIDAuMSkiLz4KPC9zdmc+')] [mask-image:linear-gradient(to_bottom,white,transparent)]" />
            
            {/* Simple visual representation of relationships since we don't have a real graph library here */}
            <div className="relative z-10 p-8 w-full max-w-4xl mx-auto flex flex-col gap-6">
              {model.relationships.map((rel, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-lg bg-card border shadow-sm w-full">
                  <div className="flex-1 text-right font-mono font-bold text-primary">{rel.from}</div>
                  <div className="flex flex-col items-center px-4">
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded mb-1">{rel.label}</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 font-mono font-bold text-primary">{rel.to}</div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="mt-6">
          <div className="grid gap-6">
            {model.metrics.map(metric => (
              <Card key={metric.name} className="shadow-sm border-border/50">
                <CardHeader className="bg-muted/20 border-b">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">{metric.name}</CardTitle>
                    <Badge variant={metric.status === 'approved' ? 'default' : 'secondary'}
                           className={cn(metric.status === 'review' && "bg-amber-500/10 text-amber-700")}>
                      {metric.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6 grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">Business Definition</h4>
                      <p className="text-foreground">{metric.businessDefinition}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">Owner</h4>
                      <p className="text-sm font-medium">{metric.owner}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">Calculation Formula</h4>
                    <div className="bg-sidebar text-sidebar-foreground p-4 rounded-md font-mono text-sm overflow-x-auto whitespace-pre">
                      {metric.formula}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}