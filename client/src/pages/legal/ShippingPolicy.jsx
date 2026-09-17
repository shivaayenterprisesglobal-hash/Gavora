import LegalPage, { LegalSection } from '@/components/legal/LegalPage';
import { DELIVERY_ESTIMATE_DAYS, FREE_SHIPPING_THRESHOLD } from '@/lib/storeRules';
import { formatCurrency } from '@/utils/format';

export function ShippingPolicy() {
  return (
    <LegalPage
      title="Shipping & delivery"
      updated="7 September 2026"
      description="How Gavora ships orders across India."
    >
      <LegalSection title="Where we deliver">
        <p>
          Orders are delivered across India. Whether a PIN code can be served depends on the courier
          used for that order.
        </p>
      </LegalSection>
      <LegalSection title="Charges">
        <p>
          A flat shipping charge applies below {formatCurrency(FREE_SHIPPING_THRESHOLD)}. Orders at
          or above that amount include free delivery on Cash on Delivery. The charge is applied
          automatically — there is no coupon to enter. The same threshold will apply to online
          payments when they are available.
        </p>
      </LegalSection>
      <LegalSection title="Timing">
        <p>
          Most orders are expected to arrive within {DELIVERY_ESTIMATE_DAYS.min}–
          {DELIVERY_ESTIMATE_DAYS.max} days of dispatch. You will receive tracking once the parcel
          is handed to the courier.
        </p>
      </LegalSection>
    </LegalPage>
  );
}

export default ShippingPolicy;
