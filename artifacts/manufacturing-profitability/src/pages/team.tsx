import { useGetTeam } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, UserPlus, Shield, Mail } from "lucide-react";

export default function Team() {
  const { data: team, isLoading } = useGetTeam();

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
          <h1 className="text-3xl font-bold tracking-tight">Team & Governance</h1>
          <p className="text-muted-foreground mt-1">
            Manage workspace members, data roles, and approval routing.
          </p>
        </div>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" /> Invite Member
        </Button>
      </div>

      <Card className="shadow-sm border-border/50">
        <CardHeader className="bg-muted/20 border-b">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            Workspace Members
          </CardTitle>
          <CardDescription>
            Users with access to this environment and their data scopes.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {!team || team.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
              <p>No team members found.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Data Scope</TableHead>
                  <TableHead>Approvals</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {team.map((member) => (
                  <TableRow key={member.id} className="hover:bg-muted/10">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-primary/10 text-primary font-medium">
                            {member.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-medium">{member.name}</span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Mail className="h-3 w-3" /> {member.email}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm font-medium">
                        <Shield className="h-3.5 w-3.5 text-primary" />
                        {member.role}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-background text-xs">
                        {member.scope}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {member.approvals.map((app, i) => (
                          <Badge key={i} variant="secondary" className="text-[10px] uppercase tracking-wider py-0">
                            {app}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={member.status === 'active' ? 'default' : 'outline'} className={member.status === 'active' ? 'bg-emerald-500 hover:bg-emerald-600' : 'text-muted-foreground'}>
                        {member.status}
                      </Badge>
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