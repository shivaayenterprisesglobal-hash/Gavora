import { Navigate, useLocation } from 'react-router-dom';

import Container from '@/components/ui/Container';
import Skeleton from '@/components/ui/Skeleton';
import { useAuth } from '@/context/authContext';

function AuthLoading() {
  return (
    <Container className="py-16" aria-busy="true">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="mt-4 h-4 w-72" />
      <span className="sr-only">Checking your session</span>
    </Container>
  );
}

/** Redirects unsigned-in visitors to login, preserving the destination. */
export function RequireAuth({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <AuthLoading />;
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}

export default RequireAuth;
