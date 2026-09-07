import { Link } from 'react-router-dom';

import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

/**
 * Phase 1 form shell. Submission is intentionally inert until /api/auth/signup
 * is implemented, so no credentials are ever sent anywhere.
 */
export function Signup() {
  return (
    <div>
      <h1 className="text-3xl">Create your account</h1>
      <p className="text-ink-500 mt-2 text-sm">
        Already registered?{' '}
        <Link to="/login" className="text-ink-900 font-medium underline underline-offset-4">
          Sign in
        </Link>
      </p>

      <form
        className="mt-8 flex flex-col gap-4"
        onSubmit={(event) => event.preventDefault()}
        aria-describedby="signup-status"
      >
        <Input label="Full name" name="name" autoComplete="name" disabled />
        <Input label="Email" type="email" name="email" autoComplete="email" disabled />
        <Input
          label="Mobile number"
          type="tel"
          name="phone"
          autoComplete="tel"
          hint="10-digit Indian mobile number"
          disabled
        />
        <Input
          label="Password"
          type="password"
          name="password"
          autoComplete="new-password"
          hint="At least 8 characters"
          disabled
        />
        <Button type="submit" size="lg" fullWidth disabled>
          Create account
        </Button>
      </form>

      <p id="signup-status" className="text-ink-400 mt-4 text-xs">
        Authentication is implemented in the next phase.
      </p>
    </div>
  );
}

export default Signup;
