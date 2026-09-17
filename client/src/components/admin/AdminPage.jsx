import Container from '@/components/ui/Container';
import useDocumentMeta from '@/hooks/useDocumentMeta';

export function AdminPage({ title, description, actions, children }) {
  useDocumentMeta({
    title,
    description: description || `${title} — Gavora admin console.`,
    noIndex: true,
  });

  return (
    <Container className="py-8 sm:py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="gv-eyebrow">Admin</p>
          <h1 className="mt-2 text-2xl sm:text-3xl">{title}</h1>
          {description && <p className="text-ink-500 mt-2 max-w-2xl text-sm leading-relaxed">{description}</p>}
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
      <div className="mt-8">{children}</div>
    </Container>
  );
}

export default AdminPage;
