import Container from '@/components/ui/Container';

/**
 * Quiet editorial statement between the hero and the catalogue.
 * Kept short so it does not repeat the hero or the closing CTA.
 */
export function BrandIntro() {
  return (
    <section className="border-ink-100 border-b">
      <Container className="py-10 sm:py-12">
        <div className="mx-auto max-w-2xl text-center">
          <p className="gv-eyebrow">The store</p>
          <h2 className="mt-3 text-2xl sm:text-3xl">Every category. One cart.</h2>
        </div>
      </Container>
    </section>
  );
}

export default BrandIntro;
