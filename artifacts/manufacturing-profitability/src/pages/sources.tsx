import { useGetSources } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Network, Server, Cloud, RefreshCw, Plus, CheckCircle2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "wouter";

export default function Sources() {
  const { data: sources, isLoading } = useGetSources();

  if (isLoading) {
    return (
      <div className="p-6 max-w-[1200px] mx-auto space-y-8">
        <Skeleton className="h-10 w-1/4" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1200px] mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Data Sources</h1>
          <p className="text-muted-foreground mt-1">
            Connected ERPs, spreadsheets, and databases.
          </p>
        </div>
        <Button asChild>
          <Link href="/onboarding"><Plus className="mr-2 h-4 w-4" /> Connect Source</Link>
        </Button>
      </div>

      <Card className="shadow-sm border-border/50">
        <CardHeader className="bg-muted/20 border-b">
          <CardTitle className="text-lg flex items-center gap-2">
            <Network className="h-5 w-5 text-muted-foreground" />
            Configured Sources
          </CardTitle>
          <CardDescription>
            Manage automated syncs and source configurations.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {!sources || sources.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <Server className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
              <p>No data sources configured yet.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Source Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Records</TableHead>
                  <TableHead>Last Sync</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sources.map((source) => (
                  <TableRow key={source.id} className="hover:bg-muted/10">
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{source.name}</span>
                        <span className="text-xs text-muted-foreground">{source.detail}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-background text-xs uppercase tracking-wider">
                        {source.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {source.status === 'connected' && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                        {source.status === 'needs-review' && <AlertTriangle className="h-4 w-4 text-amber-500" />}
                        {source.status === 'planned' && <Cloud className="h-4 w-4 text-muted-foreground" />}
                        <span className={cn(
                          "text-sm capitalize font-medium",
                          source.status === 'connected' ? "text-emerald-700 dark:text-emerald-500" :
                          source.status === 'needs-review' ? "text-amber-700 dark:text-amber-500" : "text-muted-foreground"
                        )}>
                          {source.status.replace('-', ' ')}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {source.recordCount > 0 ? source.recordCount.toLocaleString() : '-'}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {source.lastSyncedAt ? new Date(source.lastSyncedAt).toLocaleString() : 'Never'}
                    </TableCell>
                    <TableCell className="text-right">
                      {source.status !== 'planned' && (
                        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                          <RefreshCw className="h-4 w-4 mr-2" /> Sync
                        </Button>
                      )}
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