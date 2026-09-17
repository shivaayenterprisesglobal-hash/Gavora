import { useState } from 'react';

import { AddressCard } from '@/components/checkout/AddressCard';
import AddressForm from '@/components/checkout/AddressForm';
import { validateAddress } from '@/utils/validateAddress';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import Card, { CardBody } from '@/components/ui/Card';
import EmptyState from '@/components/ui/EmptyState';
import Skeleton from '@/components/ui/Skeleton';
import { useToast } from '@/context/toastContext';
import useAsyncData from '@/hooks/useAsyncData';
import {
  createAddress,
  deleteAddress,
  listAddresses,
  setDefaultAddress,
  updateAddress,
} from '@/lib/account';
import { mapApiFieldErrors } from '@/lib/formErrors';

const EMPTY = {
  label: 'home',
  fullName: '',
  phone: '',
  line1: '',
  line2: '',
  landmark: '',
  city: '',
  state: '',
  pincode: '',
  country: 'India',
};

function toPayload(draft) {
  return {
    label: draft.label || 'home',
    fullName: draft.fullName.trim(),
    phone: draft.phone.trim(),
    line1: draft.line1.trim(),
    line2: draft.line2?.trim() ?? '',
    landmark: draft.landmark?.trim() ?? '',
    city: draft.city.trim(),
    state: draft.state,
    pincode: draft.pincode.trim(),
    country: draft.country?.trim() || 'India',
  };
}

export function Addresses() {
  const { notify } = useToast();
  const { data: addresses, isLoading, error, reload } = useAsyncData(listAddresses, []);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const list = addresses ?? [];

  function startAdd() {
    setEditingId(null);
    setDraft(EMPTY);
    setErrors({});
    setFormError('');
    setAdding(true);
  }

  function startEdit(address) {
    setAdding(false);
    setEditingId(address._id);
    setDraft({ ...EMPTY, ...address });
    setErrors({});
    setFormError('');
  }

  function cancel() {
    setAdding(false);
    setEditingId(null);
    setDraft(EMPTY);
    setErrors({});
    setFormError('');
  }

  async function handleSave(event) {
    event.preventDefault();
    const nextErrors = validateAddress(draft);
    setErrors(nextErrors);
    setFormError('');
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      const payload = toPayload(draft);
      if (editingId) {
        await updateAddress(editingId, payload);
        notify('Address updated');
      } else {
        await createAddress(payload);
        notify('Address saved');
      }
      cancel();
      reload();
    } catch (err) {
      const mapped = mapApiFieldErrors(err);
      if (Object.keys(mapped).length > 0) setErrors(mapped);
      setFormError(err.message || 'Could not save this address.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDefault(id) {
    setBusyId(id);
    try {
      await setDefaultAddress(id);
      notify('Default address updated');
      reload();
    } catch (err) {
      notify(err.message || 'Could not update the default address.', { tone: 'danger' });
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Remove this address?')) return;
    setBusyId(id);
    try {
      await deleteAddress(id);
      if (editingId === id) cancel();
      notify('Address removed');
      reload();
    } catch (err) {
      notify(err.message || 'Could not remove this address.', { tone: 'danger' });
    } finally {
      setBusyId(null);
    }
  }

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2" aria-busy="true">
        <Skeleton className="h-48 rounded-card" />
        <Skeleton className="h-48 rounded-card" />
        <span className="sr-only">Loading addresses</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" title="Could not load addresses">
        {error.message}{' '}
        <button type="button" className="font-medium underline underline-offset-2" onClick={reload}>
          Retry
        </button>
      </Alert>
    );
  }

  const formOpen = adding || Boolean(editingId);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl">Saved addresses</h2>
        <Button size="sm" variant="outline" onClick={formOpen ? cancel : startAdd}>
          {formOpen ? 'Cancel' : 'Add address'}
        </Button>
      </div>

      {formOpen && (
        <Card>
          <CardBody>
            <h3 className="font-sans text-sm font-semibold">
              {editingId ? 'Edit address' : 'New address'}
            </h3>
            {formError && (
              <Alert variant="danger" title="Could not save" className="mt-4">
                {formError}
              </Alert>
            )}
            <form onSubmit={handleSave} className="mt-4 space-y-5" noValidate>
              <AddressForm value={draft} onChange={setDraft} errors={errors} />
              <Button type="submit" loading={saving}>
                Save address
              </Button>
            </form>
          </CardBody>
        </Card>
      )}

      {list.length === 0 && !formOpen ? (
        <EmptyState
          icon="mapPin"
          title="No saved addresses"
          description="Add a delivery address to check out faster next time."
          actions={
            <Button size="sm" onClick={startAdd}>
              Add address
            </Button>
          }
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {list.map((address) => (
            <li key={address._id}>
              <AddressCard
                address={address}
                actions={
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => startEdit(address)}
                      disabled={busyId === address._id}
                    >
                      Edit
                    </Button>
                    {!address.isDefault && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDefault(address._id)}
                        loading={busyId === address._id}
                      >
                        Set as default
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(address._id)}
                      disabled={busyId === address._id}
                    >
                      Remove
                    </Button>
                  </>
                }
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Addresses;
