import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';

import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Skeleton from '@/components/ui/Skeleton';
import { useAuth } from '@/context/authContext';
import useDocumentMeta from '@/hooks/useDocumentMeta';
import { mapApiFieldErrors } from '@/lib/formErrors';

/**
 * Customer sign-in. Credentials go to POST /api/auth/login; the session cookie
 * is httpOnly and never enters JavaScript.
 */
export function Login() {
  const { login, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const errorRef = useRef(null);

  useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error]);

  const from =
    location.state?.from?.pathname && location.state.from.pathname !== '/login'
      ? `${location.state.from.pathname}${location.state.from.search ?? ''}`
      : '/account';

  useDocumentMeta({
    title: 'Sign in',
    description: 'Sign in to your Gavora account.',
    noIndex: true,
  });

  if (isLoading) {
    return (
      <div aria-busy="true">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="mt-4 h-4 w-64" />
        <span className="sr-only">Checking your session</span>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
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
      await login({ email, password });
    } catch (err) {
      const mapped = mapApiFieldErrors(err);
      setFieldErrors(mapped);
      setError(err.message || 'Could not sign in. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <p className="gv-eyebrow">Welcome back</p>
      <h1 className="mt-3 text-3xl sm:text-4xl">Sign in</h1>
      <p className="text-ink-500 mt-2 text-sm">
        New to Gavora?{' '}
        <Link to="/signup" className="text-ink-900 font-medium underline underline-offset-4">
          Create an account
        </Link>
      </p>

      {error && (
        <Alert ref={errorRef} variant="danger" title="Could not sign in" className="mt-6">
          {error}
        </Alert>
      )}

      <form className="mt-8 flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
        <Input
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
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
        <Button type="submit" size="lg" fullWidth loading={submitting}>
          Sign in
        </Button>
      </form>
    </div>
  );
}

export default Login;
