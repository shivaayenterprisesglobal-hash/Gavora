import { useState } from 'react';
import { Navigate } from 'react-router-dom';

import Button from '@/components/ui/Button';
import Card, { CardBody } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Logo from '@/components/layout/Logo';
import Alert from '@/components/ui/Alert';
import { useAuth } from '@/context/authContext';
import useDocumentMeta from '@/hooks/useDocumentMeta';
import { mapApiFieldErrors } from '@/lib/formErrors';

/**
 * Admin sign-in lives outside AdminLayout and outside the customer auth flow.
 * A customer session will never satisfy the admin guard.
 */
export function AdminLogin() {
  const { adminLogin, isAuthenticated, isAdmin, isLoading } = useAuth();
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useDocumentMeta({
    title: 'Admin sign in',
    description: 'Gavora administrator console.',
    noIndex: true,
  });

  if (!isLoading && isAuthenticated && isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setFieldErrors({});

    const form = new FormData(event.currentTarget);
    const email = String(form.get('email') ?? '').trim();
    const password = String(form.get('password') ?? '');

    if (!email || !password) {
      setError('Enter your email and password.');
      return;
    }

    setSubmitting(true);
    try {
      await adminLogin({ email, password });
    } catch (err) {
      const mapped = mapApiFieldErrors(err);
      setFieldErrors(mapped);
      setError(err.message || 'Could not sign in. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-ink-950 flex min-h-dvh flex-col items-center justify-center px-5 py-12">
      <Logo to="/admin/login" tone="light" />
      <p className="text-ink-500 mt-2 text-xs tracking-widest uppercase">Admin console</p>

      <Card className="mt-8 w-full max-w-sm">
        <CardBody>
          <h1 className="text-2xl">Administrator sign in</h1>
          <p className="text-ink-500 mt-2 text-sm">Authorised personnel only.</p>

          {error && (
            <Alert variant="danger" title="Could not sign in" className="mt-5">
              {error}
            </Alert>
          )}

          <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
            <Input
              label="Email"
              type="email"
              name="email"
              autoComplete="username"
              required
              error={fieldErrors.email}
            />
            <Input
              label="Password"
              type="password"
              name="password"
              autoComplete="current-password"
              required
              error={fieldErrors.password}
            />
            <Button type="submit" size="lg" fullWidth loading={submitting} disabled={isLoading}>
              Sign in
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}

export default AdminLogin;
