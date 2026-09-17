import { Navigate } from 'react-router-dom';

import Button from '@/components/ui/Button';
import Container from '@/components/ui/Container';
import EmptyState from '@/components/ui/EmptyState';
import Skeleton from '@/components/ui/Skeleton';
import { useAuth } from '@/context/authContext';

function AuthLoading() {
  return (
    <Container className="py-16" aria-busy="true">
      <Skeleton className="h-8 w-48" />
      <span className="sr-only">Checking administrator session</span>
    </Container>
  );
}

/**
 * Admin console guard. Customers who are signed in see a 403 rather than the
 * admin login, so a customer token can never be mistaken for operator access.
 */
export function RequireAdmin({ children }) {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  if (isLoading) return <AuthLoading />;
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }
  if (!isAdmin) {
    return (
      <Container className="py-16">
        <EmptyState
          icon="shield"
          tone="danger"
          title="Administrator access required"
          description="This area is limited to Gavora operators. Your customer account cannot open the admin console."
          actions={
            <>
              <Button to="/">Back to store</Button>
              <Button to="/account" variant="outline">
                My account
              </Button>
            </>
          }
        />
      </Container>
    );
  }

  return children;
}

export default RequireAdmin;
