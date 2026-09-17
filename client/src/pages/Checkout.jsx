import { useMemo, useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

import CartSummary from '@/components/cart/CartSummary';
import AddressForm from '@/components/checkout/AddressForm';
import { validateAddress } from '@/utils/validateAddress';
import { AddressOption } from '@/components/checkout/AddressCard';
import PaymentMethodPicker from '@/components/checkout/PaymentMethodPicker';
import Alert from '@/components/ui/Alert';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import Button from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Choice';
import Container from '@/components/ui/Container';
import Icon from '@/components/ui/Icon';
import Skeleton from '@/components/ui/Skeleton';
import { useAuth } from '@/context/authContext';
import { useCart } from '@/context/cartContext';
import useAsyncData from '@/hooks/useAsyncData';
import useDocumentMeta from '@/hooks/useDocumentMeta';
import { createOrder, listAddresses } from '@/lib/account';
import { isCodAvailable } from '@/lib/storeRules';

const EMPTY_ADDRESS = {
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

function newCheckoutKey() {
  return globalThis.crypto?.randomUUID?.() ?? `gv-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    items,
    isEmpty,
    isLoading,
    itemCount,
    subtotal,
    discount,
    shipping,
    total,
    warnings,
    refreshCart,
  } = useCart();

  const { data: loadedAddresses, reload: reloadAddresses } = useAsyncData(listAddresses, []);
  const savedAddresses = useMemo(() => loadedAddresses ?? [], [loadedAddresses]);

  const [addressModeOverride, setAddressModeOverride] = useState(null);
  const addressMode = addressModeOverride ?? (savedAddresses.length > 0 ? 'saved' : 'new');
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [newAddress, setNewAddress] = useState(() => ({
    ...EMPTY_ADDRESS,
    fullName: user?.name ?? '',
    phone: user?.phone ?? '',
  }));
  const [saveAddress, setSaveAddress] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [errors, setErrors] = useState({ address: {} });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const checkoutKeyRef = useRef(newCheckoutKey());

  const defaultSavedId = savedAddresses.find((address) => address.isDefault)?._id ?? savedAddresses[0]?._id ?? '';
  const activeSavedId = selectedAddressId || defaultSavedId;

  useDocumentMeta({
    title: 'Checkout',
    description: 'Complete your Gavora order.',
    noIndex: true,
  });

  const selectedAddress = useMemo(
    () => savedAddresses.find((address) => address._id === activeSavedId) ?? null,
    [savedAddresses, activeSavedId],
  );

  const hasUnavailable = items.some((line) => line.available === false);

  if (isLoading) {
    return (
      <Container className="py-8 sm:py-12" aria-busy="true">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="mt-6 h-10 w-56" />
        <Skeleton className="mt-10 h-64 w-full rounded-card" />
        <span className="sr-only">Loading checkout</span>
      </Container>
    );
  }

  if (isEmpty && !submitting) {
    return <Navigate to="/cart" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');

    if (paymentMethod !== 'cod') {
      setFormError('Online payment is not available yet. Please choose Cash on Delivery.');
      return;
    }

    if (hasUnavailable) {
      setFormError('Remove unavailable items from your cart before placing the order.');
      return;
    }

    const addressErrors = addressMode === 'new' ? validateAddress(newAddress) : {};
    setErrors({ address: addressErrors });

    if (Object.keys(addressErrors).length > 0) {
      return;
    }

    if (addressMode === 'saved' && !selectedAddress) {
      setFormError('Select a delivery address.');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        paymentMethod: 'cod',
        checkoutKey: checkoutKeyRef.current,
      };

      if (addressMode === 'saved') {
        payload.addressId = selectedAddress._id;
      } else {
        payload.address = {
          label: newAddress.label,
          fullName: newAddress.fullName.trim(),
          phone: newAddress.phone.trim(),
          line1: newAddress.line1.trim(),
          line2: newAddress.line2.trim(),
          landmark: newAddress.landmark.trim(),
          city: newAddress.city.trim(),
          state: newAddress.state,
          pincode: newAddress.pincode.trim(),
          country: newAddress.country || 'India',
        };
        payload.saveAddress = saveAddress;
      }

      const order = await createOrder(payload);
      navigate(`/order/${order.orderNumber}`, { replace: true });
      await refreshCart();
      if (payload.saveAddress) reloadAddresses();
    } catch (err) {
      setFormError(err.message || 'Could not place your order.');
      await refreshCart();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container className="py-8 sm:py-12">
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/' },
          { label: 'Cart', to: '/cart' },
          { label: 'Checkout' },
        ]}
      />

      <div className="mt-6">
        <p className="gv-eyebrow">Checkout</p>
        <h1 className="mt-2 text-3xl sm:text-4xl">Checkout</h1>
      </div>

      {warnings?.length > 0 && (
        <Alert variant="warning" title="Some items need attention" className="mt-6">
          {warnings.map((warning) => (
            <p key={String(warning.productId)}>{warning.message}</p>
          ))}
        </Alert>
      )}

      {formError && (
        <Alert variant="danger" title="Could not place order" className="mt-6">
          {formError}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]" noValidate>
        <div className="space-y-5">
          <section className="border-ink-100 bg-canvas-raised rounded-card border p-5 sm:p-6">
            <h2 className="font-sans text-base font-semibold">1. Customer information</h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-ink-500 text-xs font-medium">Name</dt>
                <dd className="text-ink-900 mt-1 text-sm font-medium">{user?.name || '—'}</dd>
              </div>
              <div>
                <dt className="text-ink-500 text-xs font-medium">Email</dt>
                <dd className="text-ink-900 mt-1 text-sm font-medium">{user?.email || '—'}</dd>
              </div>
              {user?.phone ? (
                <div>
                  <dt className="text-ink-500 text-xs font-medium">Phone</dt>
                  <dd className="text-ink-900 mt-1 text-sm font-medium">{user.phone}</dd>
                </div>
              ) : null}
            </dl>
          </section>

          <section className="border-ink-100 bg-canvas-raised rounded-card border p-5 sm:p-6">
            <h2 className="font-sans text-base font-semibold">2. Delivery address</h2>

            <div className="mt-4 flex flex-wrap gap-2">
              {savedAddresses.length > 0 && (
                <Button
                  type="button"
                  size="sm"
                  variant={addressMode === 'saved' ? 'primary' : 'outline'}
                  onClick={() => setAddressModeOverride('saved')}
                >
                  Saved addresses
                </Button>
              )}
              <Button
                type="button"
                size="sm"
                variant={addressMode === 'new' ? 'primary' : 'outline'}
                onClick={() => setAddressModeOverride('new')}
              >
                New address
              </Button>
            </div>

            {addressMode === 'saved' ? (
              <div className="mt-5 flex flex-col gap-3">
                {savedAddresses.map((address) => (
                  <AddressOption
                    key={address._id}
                    address={address}
                    checked={activeSavedId === address._id}
                    onChange={() => setSelectedAddressId(address._id)}
                  />
                ))}
              </div>
            ) : (
              <div className="mt-5 space-y-4">
                <AddressForm value={newAddress} onChange={setNewAddress} errors={errors.address} />
                <Checkbox
                  label="Save this address to my account"
                  checked={saveAddress}
                  onChange={(event) => setSaveAddress(event.target.checked)}
                />
              </div>
            )}
          </section>

          <section className="border-ink-100 bg-canvas-raised rounded-card border p-5 sm:p-6">
            <h2 className="font-sans text-base font-semibold">3. Payment method</h2>
            <p className="text-ink-500 mt-2 text-sm leading-relaxed">
              Cash on Delivery is available now. Online payment is coming soon — no card details
              are collected on this page.
            </p>
            <div className="mt-5">
              <PaymentMethodPicker value={paymentMethod} onChange={setPaymentMethod} total={total} />
            </div>
          </section>
        </div>

        <div>
          <CartSummary
            itemCount={itemCount}
            subtotal={subtotal}
            discount={discount}
            shipping={shipping}
            total={total}
            checkout
          >
            <ul className="text-ink-500 mt-4 space-y-2 text-xs">
              {items.map((line) => (
                <li key={String(line.productId)} className="flex justify-between gap-3">
                  <span className="min-w-0 truncate">
                    {line.quantity} × {line.name}
                  </span>
                </li>
              ))}
            </ul>
            <Button
              type="submit"
              size="lg"
              fullWidth
              className="mt-5"
              loading={submitting}
              disabled={hasUnavailable || paymentMethod !== 'cod' || !isCodAvailable(total)}
            >
              Place order
              <Icon name="arrowRight" size="sm" />
            </Button>
            <p className="text-ink-500 mt-3 text-center text-xs">
              You will pay in cash when the order is delivered. Payment stays pending until then.
            </p>
          </CartSummary>
        </div>
      </form>
    </Container>
  );
}

export default Checkout;
