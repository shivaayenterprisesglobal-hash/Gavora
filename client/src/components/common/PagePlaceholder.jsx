import Container from '@/components/ui/Container';
import Card, { CardBody } from '@/components/ui/Card';

/**
 * Phase 1 stand-in for a page that is routed but not yet built. It renders the
 * real design tokens and spacing so layout and responsiveness are verifiable,
 * and lists the scope agreed for that page.
 */
export function PagePlaceholder({ eyebrow, title, description, scope = [] }) {
  return (
    <Container className="py-14 sm:py-20">
      <div className="max-w-2xl">
        {eyebrow && <p className="gv-eyebrow mb-3">{eyebrow}</p>}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl">{title}</h1>
        {description && <p className="text-ink-500 mt-4 text-base leading-relaxed">{description}</p>}
      </div>

      {scope.length > 0 && (
        <Card className="mt-10 max-w-2xl">
          <CardBody>
            <p className="gv-eyebrow mb-4">Planned for this page</p>
            <ul className="grid gap-2 sm:grid-cols-2">
              {scope.map((item) => (
                <li key={item} className="text-ink-600 flex items-start gap-2 text-sm">
                  <span aria-hidden="true" className="bg-gold-500 mt-1.5 size-1.5 shrink-0 rounded-full" />
                  {item}
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      )}
    </Container>
  );
}

export default PagePlaceholder;
