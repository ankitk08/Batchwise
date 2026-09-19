import { Link, useLocation } from "wouter"
import { BarChart3, Briefcase, Settings, Database, Activity, LayoutDashboard, DatabaseZap } from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Cockpit", href: "/", icon: LayoutDashboard },
  { name: "Jobs", href: "/jobs", icon: Briefcase },
  { name: "Sources", href: "/sources", icon: DatabaseZap },
]

export function Shell({ children }: { children: React.ReactNode }) {
  const [location] = useLocation()

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="w-full md:w-64 border-r bg-sidebar flex-shrink-0 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-sidebar-border">
          <Activity className="w-6 h-6 text-sidebar-primary mr-3" />
          <span className="text-lg font-bold text-sidebar-foreground tracking-tight">Plant Controller</span>
        </div>
        <div className="flex-1 py-6 px-4 space-y-1">
          {navigation.map((item) => {
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href))
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
              >
                <item.icon className="w-5 h-5 mr-3 flex-shrink-0 opacity-80" />
                {item.name}
              </Link>
            )
          })}
        </div>
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center text-sidebar-foreground font-semibold text-sm">
              OP
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-sidebar-foreground">Operations Team</p>
              <p className="text-xs text-sidebar-foreground/60">owner-led-shop.com</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden h-[100dvh] overflow-y-auto">
        <div className="flex-1 p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
