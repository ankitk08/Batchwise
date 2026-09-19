import { useGetAdminOverview } from "@workspace/api-client-react";
import { Activity, Database, FileSpreadsheet, MessageSquare, ShieldCheck, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function Admin() {
  const { data, isLoading, isError } = useGetAdminOverview();

  if (isLoading) {
    return <div className="p-6 max-w-6xl mx-auto space-y-6"><Skeleton className="h-10 w-1/3" /><Skeleton className="h-32" /><Skeleton className="h-80" /></div>;
  }

  if (isError || !data) {
    return <div className="p-8 text-center text-muted-foreground">Unable to load workspace administration data.</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Workspace Admin</h1>
          <p className="text-muted-foreground mt-1">Real users, persisted activity, and PostgreSQL-backed workspace data.</p>
        </div>
        <Badge className="w-fit bg-emerald-600 hover:bg-emerald-600">
          <Database className="h-3.5 w-3.5 mr-1.5" /> PostgreSQL persistent
        </Badge>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-5 flex items-center gap-4">
          <ShieldCheck className="h-9 w-9 text-primary" />
          <div>
            <p className="font-semibold">{data.workspaceName}</p>
            <p className="text-sm text-muted-foreground">Every upload and copilot question below survives refresh and is isolated to this workspace.</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        <Metric label="Users seen" value={data.userCount} icon={Users} />
        <Metric label="Production runs" value={data.productionRunCount} icon={Activity} />
        <Metric label="Saved uploads" value={data.uploadCount} icon={FileSpreadsheet} />
        <Metric label="Saved questions" value={data.questionCount} icon={MessageSquare} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Workspace users</CardTitle>
            <CardDescription>Accounts that have opened this workspace.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>User</TableHead><TableHead>Role</TableHead><TableHead>Last active</TableHead></TableRow></TableHeader>
              <TableBody>
                {data.users.map((user) => (
                  <TableRow key={user.userId}>
                    <TableCell className="font-medium">{user.displayName}</TableCell>
                    <TableCell><Badge variant="secondary">{user.role}</Badge></TableCell>
                    <TableCell className="text-muted-foreground">{new Date(user.lastSeenAt).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent persisted activity</CardTitle>
            <CardDescription>Uploads and questions recorded by the API.</CardDescription>
          </CardHeader>
          <CardContent>
            {data.recentActivity.length === 0 ? (
              <div className="py-10 text-center text-muted-foreground">Upload a CSV or ask the copilot a question to create activity.</div>
            ) : (
              <div className="space-y-4">
                {data.recentActivity.map((item, index) => (
                  <div key={`${item.occurredAt}-${index}`} className="flex gap-3 border-b pb-4 last:border-0">
                    <div className="h-9 w-9 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      {item.type === "upload" ? <FileSpreadsheet className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium">{item.label}</p>
                      <p className="text-sm text-muted-foreground truncate">{item.detail}</p>
                      <p className="text-xs text-muted-foreground mt-1">{new Date(item.occurredAt).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Metric({ label, value, icon: Icon }: { label: string; value: number; icon: typeof Users }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between text-muted-foreground"><span className="text-sm font-medium">{label}</span><Icon className="h-4 w-4" /></div>
        <div className="text-3xl font-bold mt-3 font-mono">{value}</div>
      </CardContent>
    </Card>
  );
}