import Button from '@/components/ui/Button';
import Container from '@/components/ui/Container';
import useDocumentMeta from '@/hooks/useDocumentMeta';

export function NotFound() {
  useDocumentMeta({
    title: 'Page not found',
    description: 'This page does not exist on Gavora.',
    noIndex: true,
  });

  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="gv-eyebrow mb-3">Error 404</p>
      <h1 className="text-4xl sm:text-5xl">This page does not exist</h1>
      <p className="text-ink-500 mt-4 max-w-md text-sm leading-relaxed">
        The link may be outdated, or the product may no longer be available.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button to="/">Back to home</Button>
        <Button to="/shop" variant="outline">
          Browse the store
        </Button>
      </div>
    </Container>
  );
}

export default NotFound;
