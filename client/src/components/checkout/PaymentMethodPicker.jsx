import Badge from '@/components/ui/Badge';
import Icon from '@/components/ui/Icon';
import { RadioCard } from '@/components/ui/Choice';
import { COD_MAX_ORDER_VALUE, isCodAvailable } from '@/lib/storeRules';
import { formatCurrency } from '@/utils/format';

/**
 * Payment method picker.
 *
 * Online payment is shown but unavailable until the Razorpay phase. COD is the
 * only method that can create an order in this phase, and is disabled above the
 * store's configured ceiling.
 */
export function PaymentMethodPicker({ value, onChange, total }) {
  const codOk = isCodAvailable(total);

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="sr-only">Payment method</legend>

      <RadioCard
        name="paymentMethod"
        value="online"
        checked={value === 'online'}
        onChange={() => onChange('online')}
        disabled
        icon={<Icon name="card" size="sm" className="text-ink-500" />}
        label="Online payment"
        badge={
          <Badge variant="neutral" size="sm">
            Coming soon
          </Badge>
        }
        description="Pay with UPI, cards, net banking or wallets. This option cannot be used yet."
        className="cursor-not-allowed opacity-60"
      />

      <RadioCard
        name="paymentMethod"
        value="cod"
        checked={value === 'cod'}
        onChange={() => onChange('cod')}
        disabled={!codOk}
        icon={<Icon name="cash" size="sm" className="text-ink-500" />}
        label="Cash on Delivery"
        description={
          codOk
            ? 'Pay in cash when your order arrives. Available on orders up to ' +
              formatCurrency(COD_MAX_ORDER_VALUE) +
              '.'
            : `Cash on Delivery is available on orders up to ${formatCurrency(COD_MAX_ORDER_VALUE)}.`
        }
        className={!codOk ? 'cursor-not-allowed opacity-60' : undefined}
      />
    </fieldset>
  );
}

export default PaymentMethodPicker;
