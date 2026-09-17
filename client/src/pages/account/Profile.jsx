import { useState } from 'react';

import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import Card, { CardBody } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Skeleton from '@/components/ui/Skeleton';
import { useAuth } from '@/context/authContext';
import { useToast } from '@/context/toastContext';
import useAsyncData from '@/hooks/useAsyncData';
import { changePassword, getProfile, updateProfile } from '@/lib/account';
import { mapApiFieldErrors } from '@/lib/formErrors';
import { formatDate } from '@/utils/format';

function ProfileEditor({ profile }) {
  const { applyUser } = useAuth();
  const { notify } = useToast();
  const [form, setForm] = useState({
    name: profile.name ?? '',
    email: profile.email ?? '',
    phone: profile.phone ?? '',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const set = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError('');
    setFieldErrors({});
    setSaving(true);

    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
      };
      if (form.phone.trim()) payload.phone = form.phone.trim();
      const updated = await updateProfile(payload);
      applyUser(updated);
      notify('Profile saved');
    } catch (err) {
      const mapped = mapApiFieldErrors(err);
      setFieldErrors(mapped);
      setFormError(err.message || 'Could not save your profile.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardBody>
          <h2 className="text-xl">Profile</h2>
          <p className="text-ink-500 mt-1 text-sm">Member since {formatDate(profile.createdAt)}</p>

          {formError && (
            <Alert variant="danger" title="Could not save" className="mt-4">
              {formError}
            </Alert>
          )}

          <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit} noValidate>
            <Input
              label="Full name"
              name="name"
              autoComplete="name"
              required
              value={form.name}
              onChange={set('name')}
              error={fieldErrors.name}
            />
            <Input
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={form.email}
              onChange={set('email')}
              error={fieldErrors.email}
            />
            <Input
              label="Mobile number"
              name="phone"
              type="tel"
              autoComplete="tel"
              value={form.phone}
              onChange={set('phone')}
              error={fieldErrors.phone}
            />
            <div className="flex items-end">
              <Button type="submit" loading={saving}>
                Save changes
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      <PasswordChangeForm />
    </div>
  );
}

function PasswordChangeForm() {
  const { notify } = useToast();
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError('');
    setFieldErrors({});

    const form = event.currentTarget;
    const currentPassword = String(new FormData(form).get('currentPassword') ?? '');
    const newPassword = String(new FormData(form).get('newPassword') ?? '');
    const confirmPassword = String(new FormData(form).get('confirmPassword') ?? '');

    const nextErrors = {};
    if (!currentPassword) nextErrors.currentPassword = 'Enter your current password';
    if (newPassword.length < 8) nextErrors.newPassword = 'Password must be at least 8 characters';
    if (newPassword !== confirmPassword) nextErrors.confirmPassword = 'Passwords do not match';
    if (currentPassword && newPassword && currentPassword === newPassword) {
      nextErrors.newPassword = 'New password must be different from the current password';
    }
    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      setFormError('Please correct the highlighted fields.');
      return;
    }

    setSaving(true);
    try {
      await changePassword({ currentPassword, newPassword });
      form.reset();
      notify('Password updated');
    } catch (err) {
      setFieldErrors(mapApiFieldErrors(err));
      setFormError(err.message || 'Could not update your password.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardBody>
        <h2 className="text-xl">Password</h2>
        <p className="text-ink-500 mt-1 text-sm">
          Changing your password signs out other devices. This session stays signed in.
        </p>

        {formError && (
          <Alert variant="danger" title="Could not update password" className="mt-4">
            {formError}
          </Alert>
        )}

        <form className="mt-6 grid max-w-md gap-4" onSubmit={handleSubmit} noValidate>
          <Input
            label="Current password"
            name="currentPassword"
            type="password"
            autoComplete="current-password"
            required
            error={fieldErrors.currentPassword}
          />
          <Input
            label="New password"
            name="newPassword"
            type="password"
            autoComplete="new-password"
            required
            hint="At least 8 characters."
            error={fieldErrors.newPassword}
          />
          <Input
            label="Confirm new password"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            error={fieldErrors.confirmPassword}
          />
          <div>
            <Button type="submit" loading={saving}>
              Update password
            </Button>
          </div>
        </form>

        <p className="text-ink-500 mt-8 max-w-md text-sm">
          Email verification is not available. No email provider is configured on this store.
        </p>
      </CardBody>
    </Card>
  );
}

export function Profile() {
  const { data: profile, isLoading, error, reload } = useAsyncData(getProfile, []);

  if (isLoading) {
    return (
      <div className="space-y-4" aria-busy="true">
        <Skeleton className="h-40 w-full rounded-card" />
        <span className="sr-only">Loading profile</span>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <Alert variant="danger" title="Could not load profile">
        {error?.message || 'Please try again.'}{' '}
        <button type="button" className="font-medium underline underline-offset-2" onClick={reload}>
          Retry
        </button>
      </Alert>
    );
  }

  return <ProfileEditor key={profile._id} profile={profile} />;
}

export default Profile;
