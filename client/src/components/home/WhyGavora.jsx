import Container from '@/components/ui/Container';
import Icon from '@/components/ui/Icon';
import SectionHeading from '@/components/ui/SectionHeading';

const pillars = [
  {
    index: '01',
    icon: 'grid',
    title: 'Easy shopping',
    body: 'Browse by category, filter the catalogue, and check out from one cart.',
  },
  {
    index: '02',
    icon: 'cash',
    title: 'Cash on Delivery',
    body: 'Pay in cash when the order arrives. Online payment is coming soon.',
  },
  {
    index: '03',
    icon: 'sparkle',
    title: 'Curated everyday products',
    body: 'Every listing is reviewed before it goes live. Specifications match the actual product.',
  },
  {
    index: '04',
    icon: 'shield',
    title: 'Secure checkout',
    body: 'Your order is protected at checkout. Card details are never stored on Gavora.',
  },
];

/**
 * Trust and value section. Claims stay limited to what the store can do today.
 */
export function WhyGavora() {
  return (
    <section className="bg-canvas-sunken gv-section">
      <Container>
        <SectionHeading
          eyebrow="Why shop with Gavora"
          title="A store built to be easy to trust"
          description="What the store can do today — not a list of guarantees it cannot keep."
        />

        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((pillar) => (
            <li key={pillar.title} className="border-ink-100 bg-canvas-raised rounded-card border p-5 shadow-card sm:p-6">
              <div className="flex items-center justify-between">
                <span className="text-gold-600 text-sm font-bold tracking-wide">{pillar.index}</span>
                <span className="bg-gold-50 text-gold-700 flex size-9 items-center justify-center rounded-full">
                  <Icon name={pillar.icon} size="sm" />
                </span>
              </div>
              <h3 className="mt-5 text-lg">{pillar.title}</h3>
              <p className="text-ink-600 mt-2 text-sm leading-relaxed">{pillar.body}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

export default WhyGavora;
