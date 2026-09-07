import { Link } from 'react-router-dom';

import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

/**
 * Phase 1 form shell. Submission is intentionally inert until /api/auth/login
 * is implemented, so no credentials are ever sent anywhere.
 */
export function Login() {
  return (
    <div>
      <h1 className="text-3xl">Sign in</h1>
      <p className="text-ink-500 mt-2 text-sm">
        New to Gavora?{' '}
        <Link to="/signup" className="text-ink-900 font-medium underline underline-offset-4">
          Create an account
        </Link>
      </p>

      <form
        className="mt-8 flex flex-col gap-4"
        onSubmit={(event) => event.preventDefault()}
        aria-describedby="login-status"
      >
        <Input label="Email" type="email" name="email" autoComplete="email" disabled />
        <Input
          label="Password"
          type="password"
          name="password"
          autoComplete="current-password"
          disabled
        />
        <Button type="submit" size="lg" fullWidth disabled>
          Sign in
        </Button>
      </form>

      <p id="login-status" className="text-ink-400 mt-4 text-xs">
        Authentication is implemented in the next phase.
      </p>
    </div>
  );
}

export default Login;
