import Badge from '@/components/ui/Badge';
import { RadioCard } from '@/components/ui/Choice';
import { cn } from '@/utils/cn';

function formatLines(address) {
  return [address.line1, address.line2, address.landmark, `${address.city}, ${address.state} ${address.pincode}`]
    .filter(Boolean)
    .join(', ');
}

/**
 * Selectable saved address, used at checkout. The radio is the control; the
 * rest of the card is the label so the whole surface is tappable.
 */
export function AddressOption({ address, checked, onChange, name = 'delivery-address' }) {
  return (
    <RadioCard
      name={name}
      value={address._id}
      checked={checked}
      onChange={onChange}
      label={address.fullName}
      badge={
        <span className="flex items-center gap-2">
          <Badge variant="outline" size="sm">
            {address.label}
          </Badge>
          {address.isDefault && (
            <Badge variant="ink" size="sm">
              Default
            </Badge>
          )}
        </span>
      }
      description={`${formatLines(address)} · ${address.phone}`}
    />
  );
}

/** Read-only address card for the account address book. */
export function AddressCard({ address, className, actions }) {
  return (
    <article
      className={cn(
        'rounded-card border-ink-100 bg-canvas-raised flex flex-col border p-5',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-ink-900 font-sans text-sm font-semibold">{address.fullName}</p>
          <p className="text-ink-500 mt-0.5 text-xs capitalize">{address.label}</p>
        </div>
        {address.isDefault && (
          <Badge variant="ink" size="sm">
            Default
          </Badge>
        )}
      </div>

      <p className="text-ink-600 mt-3 text-sm leading-relaxed">
        {address.line1}
        {address.line2 ? `, ${address.line2}` : ''}
        {address.landmark ? `, ${address.landmark}` : ''}
        <br />
        {address.city}, {address.state} {address.pincode}
        <br />
        {address.country}
      </p>
      <p className="text-ink-500 mt-2 text-sm">{address.phone}</p>

      {actions && <div className="mt-4 flex flex-wrap gap-2">{actions}</div>}
    </article>
  );
}

export default AddressCard;
