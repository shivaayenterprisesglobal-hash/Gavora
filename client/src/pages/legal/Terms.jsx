import LegalPage, { LegalSection } from '@/components/legal/LegalPage';

export function Terms() {
  return (
    <LegalPage
      title="Terms & conditions"
      updated="7 September 2026"
      description="Terms for using the Gavora storefront."
    >
      <LegalSection title="Using the store">
        <p>
          Gavora sells products across multiple categories to customers in India. Creating an
          account and placing an order means you agree to these terms, the shipping policy and the
          returns policy.
        </p>
      </LegalSection>
      <LegalSection title="Pricing">
        <p>
          Prices on the site are in Indian rupees and include applicable taxes unless stated
          otherwise. The amount charged is always recalculated on the server at checkout. A total
          shown in the cart is an estimate until the order is confirmed.
        </p>
      </LegalSection>
      <LegalSection title="Accounts">
        <p>
          You are responsible for keeping your password private. Gavora will never ask for it by
          email or phone.
        </p>
      </LegalSection>
    </LegalPage>
  );
}

export default Terms;
