import { useEffect, useRef, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import {
  Redirect,
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';
import { ClerkProvider, Show, useClerk } from '@clerk/react';
import { publishableKeyFromHost } from '@clerk/react/internal';
import { shadcn } from '@clerk/themes';

import { Shell } from '@/components/layout/shell';
import Home from '@/pages/home';
import SignInPage from '@/pages/sign-in';
import SignUpPage from '@/pages/sign-up';
import Cockpit from '@/pages/cockpit';
import Onboarding from '@/pages/onboarding';
import DataQuality from '@/pages/data-quality';
import Model from '@/pages/model';
import Kpis from '@/pages/kpis';
import Production from '@/pages/production';
import ProductionDetail from '@/pages/production-detail';
import Recommendations from '@/pages/recommendations';
import Sources from '@/pages/sources';
import Team from '@/pages/team';
import Admin from '@/pages/admin';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');
const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || '/'
    : path;
}

if (!clerkPubKey) {
  throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY');
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: 'clerk',
  options: {
    logoPlacement: 'inside' as const,
    logoLinkUrl: basePath || '/',
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
    socialButtonsPlacement: 'bottom' as const,
  },
  variables: {
    colorPrimary: '#207d5b',
    colorForeground: '#0f172a',
    colorMutedForeground: '#64748b',
    colorDanger: '#dc2626',
    colorBackground: '#ffffff',
    colorInput: '#f8fafc',
    colorInputForeground: '#0f172a',
    colorNeutral: '#cbd5e1',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    borderRadius: '0.5rem',
  },
  elements: {
    rootBox: 'w-full flex justify-center',
    cardBox: 'bg-white rounded-xl w-[440px] max-w-full overflow-hidden shadow-lg',
    card: '!shadow-none !border-0 !bg-transparent !rounded-none',
    footer: '!shadow-none !border-0 !bg-transparent !rounded-none',
    headerTitle: 'text-slate-950 font-bold',
    headerSubtitle: 'text-slate-600',
    formFieldLabel: 'text-slate-800',
    formFieldInput: 'bg-slate-50 border-slate-300 text-slate-950',
    formButtonPrimary: 'bg-emerald-700 hover:bg-emerald-800 text-white',
    footerActionLink: 'text-emerald-700 hover:text-emerald-800',
    footerActionText: 'text-slate-600',
    dividerText: 'text-slate-500',
    socialButtonsBlockButtonText: 'text-slate-800',
    socialButtonsBlockButton: 'border-slate-300',
    logoImage: 'h-10 w-auto',
    alertText: 'text-red-700',
    formFieldSuccessText: 'text-emerald-700',
  },
};

function WorkspaceRoutes() {
  return (
    <Shell>
      <Switch>
        <Route path="/cockpit" component={Cockpit} />
        <Route path="/onboarding" component={Onboarding} />
        <Route path="/data-quality" component={DataQuality} />
        <Route path="/model" component={Model} />
        <Route path="/kpis" component={Kpis} />
        <Route path="/production/:id">
          {(params) => <ProductionDetail id={params.id} />}
        </Route>
        <Route path="/production" component={Production} />
        <Route path="/recommendations" component={Recommendations} />
        <Route path="/sources" component={Sources} />
        <Route path="/team" component={Team} />
        <Route path="/admin" component={Admin} />
        <Route component={NotFound} />
      </Switch>
    </Shell>
  );
}

function Router() {
  return (
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/sign-in/*?" component={SignInPage} />
        <Route path="/sign-up/*?" component={SignUpPage} />
        <Route path="/app">
          <Show when="signed-in">
            <Redirect to="/cockpit" />
          </Show>
          <Show when="signed-out">
            <Redirect to="/sign-in" />
          </Show>
        </Route>
        <Route component={WorkspaceRoutes} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const previousUserId = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (
        previousUserId.current !== undefined &&
        previousUserId.current !== userId
      ) {
        queryClient.clear();
      }
      previousUserId.current = userId;
    });
    return unsubscribe;
  }, [addListener]);

  return null;
}

function ClerkRouterSync({ children }: { children: ReactNode }) {
  const [, setLocation] = useLocation();
  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      localization={{
        signIn: { start: { title: 'Welcome back', subtitle: 'Sign in to your governed manufacturing workspace' } },
        signUp: { start: { title: 'Create your workspace account', subtitle: 'Start with a secure food-processing operating review' } },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <ClerkQueryClientCacheInvalidator />
      {children}
    </ClerkProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={basePath}>
          <ClerkRouterSync>
            <Router />
          </ClerkRouterSync>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;