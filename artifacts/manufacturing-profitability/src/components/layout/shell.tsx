import { type ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { 
  LayoutDashboard, 
  UploadCloud,
  Activity, 
  Database, 
  Target,
  Factory,
  ListTodo,
  Network,
  Users,
  LogOut,
  ChevronRight,
  Menu
} from 'lucide-react';
import { Show, useClerk, useUser } from '@clerk/react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger 
} from '@/components/ui/sheet';

const navigation = [
  { name: 'Cockpit', href: '/cockpit', icon: LayoutDashboard },
  { name: 'Onboarding', href: '/onboarding', icon: UploadCloud },
  { name: 'Data Quality', href: '/data-quality', icon: Activity },
  { name: 'Semantic Model', href: '/model', icon: Database },
  { name: 'KPIs', href: '/kpis', icon: Target },
  { name: 'Production Runs', href: '/production', icon: Factory },
  { name: 'Recommendations', href: '/recommendations', icon: ListTodo },
  { name: 'Sources', href: '/sources', icon: Network },
  { name: 'Team', href: '/team', icon: Users },
];

function NavItems({ pathname }: { pathname: string }) {
  return (
    <div className="space-y-1 py-4">
      {navigation.map((item) => {
        const isActive = pathname.startsWith(item.href);
        return (
          <Link key={item.name} href={item.href} className="block">
            <div
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-primary/10 text-sidebar-primary'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
              )}
            >
              <item.icon className={cn("h-4 w-4", isActive ? "text-sidebar-primary" : "text-sidebar-foreground/50")} />
              {item.name}
              {isActive && <ChevronRight className="ml-auto h-4 w-4 opacity-50" />}
            </div>
          </Link>
        );
      })}
    </div>
  );
}

function Sidebar() {
  const [pathname] = useLocation();
  const { signOut } = useClerk();
  const { user } = useUser();
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');

  return (
    <div className="hidden border-r bg-sidebar md:block md:w-64 md:shrink-0 h-[100dvh] flex-col sticky top-0">
      <div className="flex h-14 items-center border-b border-sidebar-border px-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-sidebar-foreground">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-primary-foreground">
            <Factory className="h-4 w-4" />
          </div>
          Batchwise
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto px-3">
        <NavItems pathname={pathname} />
      </div>
      <div className="border-t border-sidebar-border p-4 flex items-center justify-between">
        <Show when="signed-in">
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-sidebar-foreground">
              {user?.fullName || user?.primaryEmailAddress?.emailAddress || 'Workspace user'}
            </p>
            <p className="text-[10px] text-sidebar-foreground/50">Authenticated workspace</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Sign out"
            onClick={() => signOut({ redirectUrl: basePath || '/' })}
            className="text-sidebar-foreground/50 hover:text-sidebar-foreground"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </Show>
        <Show when="signed-out">
          <div>
            <p className="text-xs font-semibold text-sidebar-foreground">Seeded demo</p>
            <Link href="/sign-in" className="text-[10px] text-sidebar-primary hover:underline">
              Sign in for a customer workspace
            </Link>
          </div>
        </Show>
      </div>
    </div>
  );
}

function MobileNav() {
  const [pathname] = useLocation();

  return (
    <div className="flex h-14 items-center justify-between border-b bg-background px-4 md:hidden">
      <Link href="/" className="flex items-center gap-2 font-bold">
        <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-primary-foreground">
          <Factory className="h-4 w-4" />
        </div>
        Batchwise
      </Link>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0 bg-sidebar border-r-0">
          <div className="flex h-14 items-center border-b border-sidebar-border px-6">
            <span className="font-bold text-sidebar-foreground">Menu</span>
          </div>
          <div className="px-3">
            <NavItems pathname={pathname} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-[100dvh] w-full flex-col md:flex-row bg-muted/20">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <MobileNav />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}