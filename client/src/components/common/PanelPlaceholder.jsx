import Card, { CardBody } from '@/components/ui/Card';

/**
 * Phase 1 stand-in for a panel nested inside an existing layout (account tabs,
 * admin sections), where the page heading is already provided by the layout.
 */
export function PanelPlaceholder({ title, description, scope = [] }) {
  return (
    <Card>
      <CardBody>
        <h2 className="text-xl">{title}</h2>
        {description && <p className="text-ink-500 mt-2 text-sm leading-relaxed">{description}</p>}

        {scope.length > 0 && (
          <>
            <p className="gv-eyebrow mt-6 mb-3">Planned for this section</p>
            <ul className="grid gap-2 sm:grid-cols-2">
              {scope.map((item) => (
                <li key={item} className="text-ink-600 flex items-start gap-2 text-sm">
                  <span
                    aria-hidden="true"
                    className="bg-gold-500 mt-1.5 size-1.5 shrink-0 rounded-full"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </>
        )}
      </CardBody>
    </Card>
  );
}

export default PanelPlaceholder;
