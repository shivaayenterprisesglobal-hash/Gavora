import { useEffect, useRef, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';

import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Skeleton from '@/components/ui/Skeleton';
import { useAuth } from '@/context/authContext';
import useDocumentMeta from '@/hooks/useDocumentMeta';
import { mapApiFieldErrors } from '@/lib/formErrors';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_PATTERN = /^[6-9]\d{9}$/;

/**
 * Customer registration. POST /api/auth/signup sets the httpOnly session cookie.
 */
export function Signup() {
  const { signup, isAuthenticated, isLoading } = useAuth();
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const errorRef = useRef(null);

  useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error]);

  useDocumentMeta({
    title: 'Create an account',
    description: 'Create a Gavora account to check out faster and track your orders.',
    noIndex: true,
  });

  if (isLoading) {
    return (
      <div aria-busy="true">
        <Skeleton className="h-8 w-56" />
        <span className="sr-only">Checking your session</span>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/account" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    const form = new FormData(event.currentTarget);
    const payload = {
      name: String(form.get('name') ?? '').trim(),
      email: String(form.get('email') ?? '').trim(),
      phone: String(form.get('phone') ?? '').trim(),
      password: String(form.get('password') ?? ''),
    };

    const nextErrors = {};
    if (payload.name.length < 2) nextErrors.name = 'Name must be at least 2 characters';
    if (!EMAIL_PATTERN.test(payload.email)) nextErrors.email = 'Enter a valid email address';
    if (!PHONE_PATTERN.test(payload.phone)) {
      nextErrors.phone = 'Enter a valid 10-digit Indian mobile number';
    }
    if (payload.password.length < 8) nextErrors.password = 'Password must be at least 8 characters';

    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setError('Please correct the highlighted fields.');
      return;
    }

    setSubmitting(true);
    try {
      await signup(payload);
    } catch (err) {
      const mapped = mapApiFieldErrors(err);
      setFieldErrors(mapped);
      setError(err.message || 'Could not create your account. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <p className="gv-eyebrow">Join Gavora</p>
      <h1 className="mt-3 text-3xl sm:text-4xl">Create your account</h1>
      <p className="text-ink-500 mt-2 text-sm">
        Already registered?{' '}
        <Link to="/login" className="text-ink-900 font-medium underline underline-offset-4">
          Sign in
        </Link>
      </p>

      {error && (
        <Alert ref={errorRef} variant="danger" title="Could not create account" className="mt-6">
          {error}
        </Alert>
      )}

      <form className="mt-8 flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
        <Input label="Full name" name="name" autoComplete="name" required error={fieldErrors.name} />
        <Input
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          required
          error={fieldErrors.email}
        />
        <Input
          label="Mobile number"
          type="tel"
          name="phone"
          autoComplete="tel"
          hint="10-digit Indian mobile number"
          required
          error={fieldErrors.phone}
        />
        <Input
          label="Password"
          type="password"
          name="password"
          autoComplete="new-password"
          hint="At least 8 characters"
          required
          error={fieldErrors.password}
        />
        <Button type="submit" size="lg" fullWidth loading={submitting}>
          Create account
        </Button>
      </form>
    </div>
  );
}

export default Signup;
