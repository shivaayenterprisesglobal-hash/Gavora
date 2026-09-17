import Alert from '@/components/ui/Alert';
import Container from '@/components/ui/Container';
import Rating from '@/components/ui/Rating';
import Reveal from '@/components/ui/Reveal';
import SectionHeading from '@/components/ui/SectionHeading';

/**
 * Customer reviews section.
 *
 * Gavora has no verified purchase reviews yet, so this renders SAMPLE copy
 * behind a visible notice. Authors stay labelled as sample reviewers.
 */
export function ReviewsSection({ reviews = [], isSample = true }) {
  if (reviews.length === 0) return null;

  return (
    <section className="bg-canvas-sunken gv-section">
      <Container>
        <SectionHeading
          eyebrow="Customer reviews"
          title="What shoppers will see here"
          description="Reviews are shown only for verified purchases, so this section fills in as real orders are delivered."
        />

        {isSample && (
          <Alert variant="warning" title="Sample layout" className="mt-8 max-w-3xl">
            The cards below are placeholder copy used to design this section. They are{' '}
            <strong>not real customers and not verified purchases</strong>. They will be replaced by
            reviews from delivered orders, or removed, before launch.
          </Alert>
        )}

        <ul className="mt-10 grid gap-px bg-ink-100 sm:grid-cols-2 lg:grid-cols-4">
          {reviews.map((review, index) => (
            <li key={review.id} className="bg-canvas-sunken">
              <Reveal delay={index * 60} className="flex h-full flex-col bg-canvas-raised p-6 sm:p-8">
                <Rating value={review.rating} showValue={false} />
                <h3 className="mt-5 font-display text-xl leading-snug tracking-tight">{review.title}</h3>
                <blockquote className="text-ink-500 mt-3 flex-1 text-sm leading-relaxed">
                  {review.body}
                </blockquote>
                <footer className="border-ink-100 mt-8 border-t pt-4">
                  <p className="text-ink-800 text-xs font-medium">{review.author}</p>
                  <p className="text-ink-400 mt-0.5 text-xs">
                    {review.location} · {review.category}
                  </p>
                </footer>
              </Reveal>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

export default ReviewsSection;
