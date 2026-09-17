import Alert from '@/components/ui/Alert';

/**
 * Visible marker for UI that is currently rendering placeholder data.
 * Kept as a dedicated component so the wording stays consistent and cannot
 * quietly disappear from one page while remaining on another.
 */
export function DemoNotice({ children }) {
  return (
    <Alert variant="warning" title="Sample layout">
      {children}
    </Alert>
  );
}

export default DemoNotice;
