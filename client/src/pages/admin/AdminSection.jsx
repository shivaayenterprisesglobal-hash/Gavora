import PanelPlaceholder from '@/components/common/PanelPlaceholder';
import Container from '@/components/ui/Container';

/** Shared heading + placeholder chrome for every admin section in Phase 1. */
export function AdminSection({ title, description, scope = [] }) {
  return (
    <Container className="py-10 sm:py-12">
      <p className="gv-eyebrow">Admin</p>
      <h1 className="mt-2 text-2xl sm:text-3xl">{title}</h1>
      <div className="mt-8">
        <PanelPlaceholder title={title} description={description} scope={scope} />
      </div>
    </Container>
  );
}

export default AdminSection;
