import { useState } from "react";
import { Link } from "wouter";
import { useGetDashboard, useAskQuestion, QuestionAnswer } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  TrendingDown, 
  TrendingUp, 
  AlertTriangle,
  Send,
  MessageSquare,
  Sparkles,
  Bot,
  Activity,
  DollarSign,
  PackageX,
  CalendarCheck,
  Factory
} from "lucide-react";
import { cn } from "@/lib/utils";

function MetricCard({ 
  title, 
  value, 
  description, 
  icon: Icon,
  trend,
  trendValue,
  alert
}: { 
  title: string; 
  value: string | number; 
  description?: string;
  icon: any;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  alert?: boolean;
}) {
  return (
    <Card className={cn("overflow-hidden transition-all hover-elevate", alert && "border-destructive/50")}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className={cn("h-4 w-4", alert ? "text-destructive" : "text-muted-foreground")} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold font-mono">{value}</div>
        {(description || trendValue) && (
          <div className="flex items-center gap-2 mt-1">
            {trend === 'up' && <TrendingUp className="h-3 w-3 text-emerald-500" />}
            {trend === 'down' && <TrendingDown className="h-3 w-3 text-destructive" />}
            <p className="text-xs text-muted-foreground">
              {trendValue && <span className={cn("font-medium", trend === 'up' ? "text-emerald-500" : trend === 'down' ? "text-destructive" : "")}>{trendValue} </span>}
              {description}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}

function formatPercent(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(value / 100);
}

export default function Cockpit() {
  const { data: dashboard, isLoading } = useGetDashboard();
  
  const [question, setQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'assistant', content: string | QuestionAnswer }>>([]);
  
  const askQuestion = useAskQuestion();

  const handleAsk = () => {
    if (!question.trim() || askQuestion.isPending) return;
    
    const currentQ = question;
    setQuestion("");
    setChatHistory(prev => [...prev, { role: 'user', content: currentQ }]);
    
    askQuestion.mutate({ data: { question: currentQ } }, {
      onSuccess: (data) => {
        setChatHistory(prev => [...prev, { role: 'assistant', content: data }]);
      },
      onError: () => {
        setChatHistory(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error processing your question.' }]);
      }
    });
  };

  return (
    <div className="p-6 space-y-8 max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Executive Cockpit</h1>
          <p className="text-muted-foreground mt-1">
            Operating review for {dashboard?.period || 'current period'}
          </p>
        </div>
        {dashboard?.lastSyncedAt && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-md">
            <Activity className="h-4 w-4" />
            Last synced: {new Date(dashboard.lastSyncedAt).toLocaleDateString()}
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
      ) : dashboard ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard 
              title="Total Revenue" 
              value={formatCurrency(dashboard.revenue)}
              icon={DollarSign}
            />
            <MetricCard 
              title="Contribution Margin" 
              value={formatPercent(dashboard.contributionMarginRate)}
              description="overall margin"
              trend={dashboard.marginChange >= 0 ? "up" : "down"}
              trendValue={dashboard.marginChange > 0 ? `+${dashboard.marginChange}%` : `${dashboard.marginChange}%`}
              icon={Activity}
            />
            <MetricCard 
              title="Production Yield" 
              value={formatPercent(dashboard.yieldRate)}
              description="avg across runs"
              icon={Factory}
              alert={dashboard.yieldRate < 90}
            />
            <MetricCard 
              title="Waste Cost" 
              value={formatCurrency(dashboard.wasteCost)}
              description="scrap & spoilage"
              icon={PackageX}
              trend="down"
              alert={dashboard.wasteCost > 5000}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard 
              title="Schedule Attainment" 
              value={formatPercent(dashboard.scheduleAttainment)}
              icon={CalendarCheck}
            />
            <MetricCard 
              title="Orders On Hold" 
              value={dashboard.ordersOnHold}
              icon={AlertTriangle}
              alert={dashboard.ordersOnHold > 0}
            />
            <MetricCard 
              title="At-Risk Runs" 
              value={dashboard.atRiskJobs}
              icon={AlertTriangle}
              alert={dashboard.atRiskJobs > 0}
            />
            <MetricCard 
              title="Closed Runs" 
              value={dashboard.closedJobs}
              icon={Activity}
            />
          </div>
        </>
      ) : (
        <div className="p-8 text-center text-muted-foreground border rounded-xl border-dashed">
          Failed to load dashboard data.
        </div>
      )}

      <Separator />

      <div className="grid gap-8 md:grid-cols-[1fr_400px]">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Consultant Copilot</h2>
          </div>
          
          <Card className="flex-1 min-h-[400px] flex flex-col shadow-sm border-border/50">
            <ScrollArea className="flex-1 p-4 h-[400px]">
              {chatHistory.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4 text-muted-foreground">
                  <Bot className="h-12 w-12 text-primary/20" />
                  <p>Ask a question about profitability, yield variance, or specific production runs.</p>
                  <div className="flex flex-wrap gap-2 justify-center mt-4">
                    <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80" onClick={() => setQuestion("Why did margin drop this week?")}>Why did margin drop this week?</Badge>
                    <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80" onClick={() => setQuestion("Which production runs had the lowest margin?")}>Which runs had the lowest margin?</Badge>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {chatHistory.map((msg, i) => (
                    <div key={i} className={cn("flex gap-3 text-sm", msg.role === 'user' ? "flex-row-reverse" : "flex-row")}>
                      <div className={cn("h-8 w-8 rounded-full flex items-center justify-center shrink-0", 
                        msg.role === 'user' ? "bg-primary text-primary-foreground" : "bg-sidebar-accent text-sidebar-accent-foreground"
                      )}>
                        {msg.role === 'user' ? <MessageSquare className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                      </div>
                      
                      <div className={cn("max-w-[85%] rounded-lg p-4", 
                        msg.role === 'user' ? "bg-primary/10 text-foreground" : "bg-card border shadow-sm"
                      )}>
                        {msg.role === 'user' ? (
                          msg.content as string
                        ) : typeof msg.content === 'string' ? (
                          msg.content
                        ) : (
                          <div className="space-y-4">
                            <h4 className="font-semibold text-base">{(msg.content as QuestionAnswer).headline}</h4>
                            <p className="text-muted-foreground leading-relaxed">{(msg.content as QuestionAnswer).answer}</p>
                            
                            {(msg.content as QuestionAnswer).metric && (
                              <div className="bg-muted/50 p-3 rounded-md flex items-center justify-between border">
                                <span className="font-medium">{(msg.content as QuestionAnswer).metric}</span>
                                <span className="font-mono text-lg text-primary">
                                  {(msg.content as QuestionAnswer).metricValue} {(msg.content as QuestionAnswer).metricUnit}
                                </span>
                              </div>
                            )}

                            {(msg.content as QuestionAnswer).evidence && (msg.content as QuestionAnswer).evidence.length > 0 && (
                              <div className="space-y-2 mt-4">
                                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Evidence</span>
                                <div className="space-y-2">
                                  {(msg.content as QuestionAnswer).evidence.map((ev, ei) => (
                                    <div key={ei} className="text-xs border-l-2 border-primary/50 pl-3 py-1">
                                      <span className="font-medium text-foreground">{ev.label}:</span> {ev.value}
                                      <div className="text-muted-foreground mt-0.5">{ev.detail}</div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {askQuestion.isPending && (
                    <div className="flex gap-3 text-sm">
                      <div className="h-8 w-8 rounded-full bg-sidebar-accent text-sidebar-accent-foreground flex items-center justify-center shrink-0">
                        <Bot className="h-4 w-4" />
                      </div>
                      <div className="max-w-[85%] rounded-lg p-4 bg-card border shadow-sm flex items-center gap-2 text-muted-foreground">
                        <span className="animate-pulse">Thinking</span>
                        <div className="flex gap-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>
            <div className="p-4 border-t bg-muted/20">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleAsk(); }}
                className="flex gap-2"
              >
                <Input 
                  placeholder="Ask about margin, yield, waste, or an at-risk run..." 
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  disabled={askQuestion.isPending}
                  className="flex-1 bg-background"
                />
                <Button type="submit" disabled={!question.trim() || askQuestion.isPending}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Priority Actions</h2>
          <Card className="shadow-sm border-border/50 bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-primary text-base flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Packaging control gap
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <p><strong>PR-240914-C</strong> lost $9,760 to relabeling and rework after an allergen declaration review.</p>
              <Button variant="default" size="sm" className="w-full" asChild>
                <Link href="/production/run-240914-c">Investigate Run</Link>
              </Button>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm border-border/50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2 text-muted-foreground">
                <CalendarCheck className="h-4 w-4" />
                Schedule Review
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>Two production orders are on hold or awaiting final quality clearance.</p>
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link href="/production">Review Queue</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}