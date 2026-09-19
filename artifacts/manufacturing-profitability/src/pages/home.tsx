import { useGetPrototypeProfile } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Show, useUser } from "@clerk/react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Factory, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle } from "lucide-react";

export default function Home() {
  const { data: profile, isLoading } = useGetPrototypeProfile();
  const { user } = useUser();

  return (
    <div className="min-h-[100dvh] bg-background">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-lg text-foreground">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-primary text-primary-foreground">
              <Factory className="h-5 w-5" />
            </div>
            Batchwise
          </div>
          <div className="flex items-center gap-4">
            <Show when="signed-in">
              <div className="text-sm font-medium text-muted-foreground mr-2">
                Welcome back, {user?.firstName || 'User'}
              </div>
              <Button asChild>
                <Link href="/cockpit">Enter Cockpit <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </Show>
            <Show when="signed-out">
              <Button variant="ghost" asChild>
                <Link href="/sign-in">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/sign-up">Start Free Trial</Link>
              </Button>
            </Show>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16 max-w-5xl">
        {isLoading ? (
          <div className="space-y-8">
            <Skeleton className="h-16 w-3/4 max-w-2xl" />
            <Skeleton className="h-8 w-full max-w-3xl" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
              <Skeleton className="h-64 rounded-xl" />
              <Skeleton className="h-64 rounded-xl" />
            </div>
          </div>
        ) : profile ? (
          <div className="space-y-16">
            <div className="space-y-6 max-w-3xl">
              <Badge variant="outline" className="bg-primary/10 text-primary hover:bg-primary/10 border-primary/20 text-sm py-1 px-3">
                Decision Intelligence Prototype
              </Badge>
              <h1 className="text-5xl font-extrabold tracking-tight text-foreground sm:text-6xl leading-[1.1]">
                {profile.productName}
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                A governed decision-intelligence product designed for {profile.workspaceName} controllers. 
                Ingest operating files, assess readiness, and monitor true manufacturing profitability.
              </p>
              
              <div className="flex gap-4 pt-4">
                <Show when="signed-in">
                  <Button size="lg" asChild className="h-12 px-8 text-base">
                    <Link href="/cockpit">Open Workspace</Link>
                  </Button>
                </Show>
                <Show when="signed-out">
                  <Button size="lg" asChild className="h-12 px-8 text-base">
                    <Link href="/sign-up">Deploy Workspace</Link>
                  </Button>
                  <Button size="lg" variant="outline" className="h-12 px-8 text-base" asChild>
                    <Link href="/cockpit">Explore Demo</Link>
                  </Button>
                </Show>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="border-border/50 shadow-sm">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2 text-primary">
                    <ShieldCheck className="h-5 w-5" />
                    <span className="font-semibold text-sm tracking-wider uppercase">Target Profile</span>
                  </div>
                  <CardTitle className="text-2xl">Ideal Customer Profile</CardTitle>
                  <CardDescription>Who this product is built for</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    {profile.icp.map((item, i) => (
                      <li key={i} className="flex gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-border/50 shadow-sm bg-muted/20">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2 text-amber-600">
                    <AlertCircle className="h-5 w-5" />
                    <span className="font-semibold text-sm tracking-wider uppercase">Prototype Context</span>
                  </div>
                  <CardTitle className="text-2xl">Operating Assumptions</CardTitle>
                  <CardDescription>Constraints of this environment</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    {profile.assumptions.map((item, i) => (
                      <li key={i} className="flex gap-3 text-muted-foreground">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500/50 mt-2 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="mt-8 pt-6 border-t">
                    <h4 className="font-medium text-foreground mb-3 text-sm uppercase tracking-wider">Limitations</h4>
                    <div className="flex flex-wrap gap-2">
                      {profile.prototypeLimits.map((limit, i) => (
                        <Badge key={i} variant="secondary" className="bg-background">
                          {limit}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="py-12 border-t text-center">
              <h3 className="text-2xl font-bold mb-4">First Decision Supported:</h3>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto italic">
                "{profile.firstDecision}"
              </p>
              <div className="mt-6 text-sm font-mono text-muted-foreground bg-muted inline-block px-4 py-2 rounded-md">
                Cadence: {profile.updateCadence}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-24">
            <h2 className="text-2xl font-bold text-destructive">Failed to load prototype profile</h2>
            <p className="text-muted-foreground mt-2">Please ensure the backend is running.</p>
          </div>
        )}
      </main>
    </div>
  );
}