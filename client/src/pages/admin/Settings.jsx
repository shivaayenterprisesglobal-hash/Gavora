import { useState } from 'react';

import AdminPage from '@/components/admin/AdminPage';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import Input, { Textarea } from '@/components/ui/Input';
import Skeleton from '@/components/ui/Skeleton';
import { useToast } from '@/context/toastContext';
import useAsyncData from '@/hooks/useAsyncData';
import { getAdminSettings, isHttpUrl, updateAdminSettings } from '@/lib/admin';
import { mapApiFieldErrors } from '@/lib/formErrors';
import { formatCurrency } from '@/utils/format';

function identityForm(store) {
  return {
    storeName: store?.storeName ?? 'Gavora',
    logoUrl: store?.logoUrl ?? '',
    description: store?.description ?? '',
    contactEmail: store?.contactEmail ?? '',
    contactPhone: store?.contactPhone ?? '',
  };
}

export function Settings() {
  const { notify } = useToast();
  const { data, isLoading, error, reload } = useAsyncData(getAdminSettings, []);
  const [form, setForm] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const current = form ?? identityForm(data?.store);
  const commerce = data?.commerce;

  const set = (field) => (event) => setForm((prev) => ({ ...(prev ?? current), [field]: event.target.value }));

  async function handleSubmit(event) {
    event.preventDefault();
    const errors = {};
    if (!current.storeName.trim()) errors.storeName = 'Store name is required';
    if (current.logoUrl.trim() && !isHttpUrl(current.logoUrl)) errors.logoUrl = 'Enter a valid http(s) URL';
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setFormError('Please correct the highlighted fields.');
      return;
    }

    setSaving(true);
    setFormError('');
    try {
      const saved = await updateAdminSettings({
        storeName: current.storeName.trim(),
        logoUrl: current.logoUrl.trim(),
        description: current.description.trim(),
        contactEmail: current.contactEmail.trim().toLowerCase(),
        contactPhone: current.contactPhone.trim(),
      });
      setForm(identityForm(saved.store));
      notify('Settings saved');
    } catch (err) {
      setFieldErrors(mapApiFieldErrors(err));
      setFormError(err.message || 'Could not save settings.');
    } finally {
      setSaving(false);
    }
  }

  if (isLoading) {
    return (
      <AdminPage title="Settings">
        <Skeleton className="h-64 w-full rounded-card" />
        <span className="sr-only">Loading settings</span>
      </AdminPage>
    );
  }

  if (error) {
    return (
      <AdminPage title="Settings">
        <Alert variant="danger" title="Could not load settings">
          {error.message || 'Please try again.'}{' '}
          <button type="button" className="font-medium underline underline-offset-2" onClick={reload}>
            Retry
          </button>
        </Alert>
      </AdminPage>
    );
  }

  return (
    <AdminPage
      title="Settings"
      description="Store identity can be edited here. Shipping and Cash on Delivery rules stay in server environment variables so checkout maths cannot drift."
    >
      {formError && (
        <Alert variant="danger" title="Could not save" className="mb-6">
          {formError}
        </Alert>
      )}

      <form className="grid max-w-2xl gap-4" onSubmit={handleSubmit} noValidate>
        <Input
          label="Store name"
          required
          value={current.storeName}
          onChange={set('storeName')}
          error={fieldErrors.storeName}
        />
        <Input
          label="Logo URL"
          value={current.logoUrl}
          onChange={set('logoUrl')}
          error={fieldErrors.logoUrl}
          hint="Optional https URL. Leave blank to keep the existing wordmark."
        />
        <Textarea
          label="Store description"
          rows={4}
          value={current.description}
          onChange={set('description')}
          error={fieldErrors.description}
        />
        <Input
          label="Contact email"
          type="email"
          value={current.contactEmail}
          onChange={set('contactEmail')}
          error={fieldErrors.contactEmail}
          hint="Leave blank to show “Contact details coming soon” on the storefront."
        />
        <Input
          label="Contact phone"
          value={current.contactPhone}
          onChange={set('contactPhone')}
          error={fieldErrors.contactPhone}
        />
        <Button type="submit" loading={saving}>
          Save store details
        </Button>
      </form>

      <section className="border-ink-100 mt-10 max-w-2xl rounded-card border bg-canvas-raised p-5">
        <h2 className="font-sans text-base font-semibold">Commerce rules</h2>
        <p className="text-ink-500 mt-1 text-sm">
          Read-only. These values come from the server environment ({commerce?.source}) and are
          enforced at checkout. They are not editable from this screen.
        </p>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2 text-sm">
          <div>
            <dt className="text-ink-400">Shipping flat rate</dt>
            <dd data-numeric>{formatCurrency(commerce?.shippingFlatRate)}</dd>
          </div>
          <div>
            <dt className="text-ink-400">Free shipping threshold</dt>
            <dd data-numeric>{formatCurrency(commerce?.freeShippingThreshold)}</dd>
          </div>
          <div>
            <dt className="text-ink-400">Cash on Delivery</dt>
            <dd>{commerce?.codEnabled ? 'Enabled' : 'Disabled'}</dd>
          </div>
          <div>
            <dt className="text-ink-400">COD maximum order value</dt>
            <dd data-numeric>{formatCurrency(commerce?.codMaxOrderValue)}</dd>
          </div>
        </dl>
      </section>
    </AdminPage>
  );
}

export default Settings;
