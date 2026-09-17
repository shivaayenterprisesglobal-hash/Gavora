import LegalPage, { LegalSection } from '@/components/legal/LegalPage';

export function Privacy() {
  return (
    <LegalPage
      title="Privacy policy"
      updated="7 September 2026"
      description="How Gavora handles personal information on this storefront."
    >
      <LegalSection title="What we collect">
        <p>
          When you create an account we will collect your name, email address, mobile number and
          saved delivery addresses. When you place an order we will keep the items, the delivery
          address used, and the payment method. Gavora does not store card numbers. When online
          payment is connected, card details will be handled by the payment gateway.
        </p>
      </LegalSection>
      <LegalSection title="How we use it">
        <p>
          Account details are used to sign you in, deliver orders, show order history and contact
          you about an order. We will not sell your information.
        </p>
      </LegalSection>
      <LegalSection title="Cookies">
        <p>
          The session cookie is httpOnly and is used only to keep you signed in. It is not used for
          advertising.
        </p>
      </LegalSection>
      <LegalSection title="Contact">
        <p>
          No privacy contact address is listed on this page yet.
        </p>
      </LegalSection>
    </LegalPage>
  );
}

export default Privacy;
