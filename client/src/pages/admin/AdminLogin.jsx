import Button from '@/components/ui/Button';
import Card, { CardBody } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Logo from '@/components/layout/Logo';

/**
 * Admin sign-in lives outside AdminLayout and outside the customer auth flow.
 * A customer token will never satisfy the admin guard.
 */
export function AdminLogin() {
  return (
    <div className="bg-ink-950 flex min-h-dvh flex-col items-center justify-center px-5 py-12">
      <Logo to="/admin/login" tone="light" />
      <p className="text-ink-500 mt-2 text-xs tracking-widest uppercase">Admin console</p>

      <Card className="mt-8 w-full max-w-sm">
        <CardBody>
          <h1 className="text-2xl">Administrator sign in</h1>
          <p className="text-ink-500 mt-2 text-sm">Authorised personnel only.</p>

          <form
            className="mt-6 flex flex-col gap-4"
            onSubmit={(event) => event.preventDefault()}
            aria-describedby="admin-login-status"
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

          <p id="admin-login-status" className="text-ink-400 mt-4 text-xs">
            Admin authentication is implemented in the next phase.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}

export default AdminLogin;
