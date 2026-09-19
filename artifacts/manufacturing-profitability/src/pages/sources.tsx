import { useGetSources } from "@workspace/api-client-react"
import { formatCurrency, cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { DatabaseZap, CheckCircle2, AlertTriangle, Clock, Server } from "lucide-react"

export default function Sources() {
  const { data: sources, isLoading } = useGetSources()

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Data Sources</h1>
        <p className="text-slate-500 mt-2">Connected systems feeding the profitability cockpit.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="border-slate-200">
              <CardHeader className="pb-3">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-24 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))
        ) : (
          sources?.map(source => (
            <Card key={source.id} className={cn(
              "border hover-elevate transition-all",
              source.status === 'connected' ? 'border-slate-200' : 
              source.status === 'needs-review' ? 'border-amber-200 bg-amber-50/20' : 
              'border-slate-200 border-dashed bg-slate-50'
            )}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <Server className={cn("w-5 h-5 mr-2", source.status === 'connected' ? "text-indigo-600" : "text-slate-400")} />
                    <CardTitle className="text-lg">{source.name}</CardTitle>
                  </div>
                  <Badge variant={
                    source.status === 'connected' ? 'success' : 
                    source.status === 'needs-review' ? 'warning' : 'outline'
                  } className="capitalize">
                    {source.status.replace('-', ' ')}
                  </Badge>
                </div>
                <CardDescription className="uppercase tracking-wider text-xs font-semibold pt-1">
                  {source.type}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="mb-4">
                  <p className="text-sm text-slate-600 line-clamp-2">{source.detail}</p>
                </div>
                
                <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
                  <div className="flex items-center">
                    <DatabaseZap className="w-3.5 h-3.5 mr-1" />
                    {source.recordCount > 0 ? (
                      <span className="font-mono font-medium">{source.recordCount.toLocaleString()} records</span>
                    ) : (
                      <span>Pending sync</span>
                    )}
                  </div>
                  {source.lastSyncedAt && (
                    <div className="flex items-center" title={new Date(source.lastSyncedAt).toLocaleString()}>
                      <Clock className="w-3.5 h-3.5 mr-1" />
                      {new Date(source.lastSyncedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
      
      <div className="mt-12 bg-slate-50 rounded-lg border border-slate-200 p-6 flex items-start">
        <div className="bg-white p-2 rounded-full shadow-sm mr-4 flex-shrink-0">
          <DatabaseZap className="w-6 h-6 text-indigo-600" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-slate-900">Reconciliation Engine Active</h3>
          <p className="text-sm text-slate-600 mt-1">
            The Copilot continuously reconciles data across these sources to build high-confidence margin metrics. 
            When sources conflict (e.g. ERP vs Timesheets), it highlights the discrepancy and drops the confidence score.
          </p>
        </div>
      </div>
    </div>
  )
}
