import {
  useNavigate,
  useRouterState,
  Link,
} from '@tanstack/react-router';

// Re-export Link for use in components
export { Link };

// useLocation shim — returns an object with pathname
export function useLocation() {
  const state = useRouterState();
  return {
    pathname: state.location.pathname,
    search: state.location.search,
    hash: state.location.hash,
  };
}

export { useNavigate };

export function useNavigateTo() {
  const navigate = useNavigate();
  return (path: string) => navigate({ to: path });
}
