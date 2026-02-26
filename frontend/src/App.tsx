import React from 'react';
import {
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  Link,
  useParams,
  useRouterState,
} from '@tanstack/react-router';
import { Toaster } from '@/components/ui/sonner';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import Layout from './components/Layout';
import ProfileSetupModal from './components/ProfileSetupModal';
import HeroSection from './components/HeroSection';
import SkillDirectory from './components/SkillDirectory';
import ProfilePage from './components/ProfilePage';
import UserProfileView from './components/UserProfileView';
import Dashboard from './components/Dashboard';
import ConversationThread from './components/ConversationThread';

// ── Root layout with profile setup modal ────────────────────────────────────

function RootLayout() {
  const { identity, login } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  return (
    <Layout>
      <Outlet />
      {showProfileSetup && <ProfileSetupModal open={true} />}
      <Toaster richColors position="top-right" />
    </Layout>
  );
}

// ── Home page ────────────────────────────────────────────────────────────────

function HomePage() {
  const { identity, login } = useInternetIdentity();
  const router = useRouterState();

  const handleExplore = () => {
    window.location.href = '/directory';
  };

  return (
    <div>
      <HeroSection
        onExplore={() => { window.location.href = '/directory'; }}
        onLogin={login}
        isAuthenticated={!!identity}
      />
    </div>
  );
}

// ── Profile page for other users ─────────────────────────────────────────────

function OtherProfilePage() {
  const { principal } = useParams({ strict: false }) as { principal: string };
  return <UserProfileView principalStr={principal} />;
}

// ── Messages page ─────────────────────────────────────────────────────────────

function MessagesPage() {
  const { principal } = useParams({ strict: false }) as { principal: string };
  return <ConversationThread otherUserPrincipal={principal} />;
}

// ── Route tree ───────────────────────────────────────────────────────────────

const rootRoute = createRootRoute({
  component: RootLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});

const directoryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/directory',
  component: SkillDirectory,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile',
  component: ProfilePage,
});

const userProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile/$principal',
  component: OtherProfilePage,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: Dashboard,
});

const messagesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/messages/$principal',
  component: MessagesPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  directoryRoute,
  profileRoute,
  userProfileRoute,
  dashboardRoute,
  messagesRoute,
]);

const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  return <RouterProvider router={router} />;
}
