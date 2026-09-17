import LegalPage, { LegalSection } from '@/components/legal/LegalPage';

export function ReturnsPolicy() {
  return (
    <LegalPage
      title="Returns & refunds"
      updated="7 September 2026"
      description="How returns and refunds work for Gavora orders."
    >
      <LegalSection title="Returns">
        <p>
          Unused items in original packaging can be returned within the published window after
          delivery. Items that cannot be returned for hygiene or customisation reasons will be
          marked on the product page.
        </p>
      </LegalSection>
      <LegalSection title="Refunds">
        <p>
          Prepaid orders are refunded to the original payment method after the return is received
          and checked. Cash on Delivery refunds will be issued to a bank account you provide.
        </p>
      </LegalSection>
      <LegalSection title="Damaged or wrong items">
        <p>
          If something arrives damaged or is not what you ordered, contact support with photographs
          and the order number. Do not use the product. A replacement or refund will be arranged.
        </p>
      </LegalSection>
      <LegalSection title="Contact">
        <p>
          Support phone and email are not listed on this page yet. Use the contact details in the
          store footer when they are shown.
        </p>
      </LegalSection>
    </LegalPage>
  );
}

export default ReturnsPolicy;
