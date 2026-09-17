import Container from '@/components/ui/Container';
import useDocumentMeta from '@/hooks/useDocumentMeta';

/**
 * Shared chrome for the four public policy pages. Contact details stay as
 * placeholders — inventing a phone number or email would be worse than leaving
 * them blank until the real channels exist.
 */
export function LegalPage({ title, updated, description, children }) {
  useDocumentMeta({
    title,
    description,
  });

  return (
    <Container className="max-w-3xl py-12 sm:py-16">
      <p className="gv-eyebrow">Policies</p>
      <h1 className="mt-3 text-3xl sm:text-4xl">{title}</h1>
      <p className="text-ink-500 mt-2 text-sm">Last updated {updated}</p>
      {description && <p className="text-ink-600 mt-6 text-base leading-relaxed">{description}</p>}
      <div className="mt-10 space-y-8 text-sm leading-relaxed">{children}</div>
    </Container>
  );
}

export function LegalSection({ title, children }) {
  return (
    <section>
      <h2 className="text-xl">{title}</h2>
      <div className="text-ink-600 mt-3 space-y-3">{children}</div>
    </section>
  );
}

export default LegalPage;
