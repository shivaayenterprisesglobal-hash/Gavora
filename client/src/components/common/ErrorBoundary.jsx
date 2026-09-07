import { Component } from 'react';

import Button from '@/components/ui/Button';
import Container from '@/components/ui/Container';

/**
 * Catches render-time errors anywhere below it so a single broken component
 * cannot blank the whole storefront.
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message ?? 'Unknown error' };
  }

  componentDidCatch(error, info) {
    // Replace with a real error-reporting sink before launch.
    console.error('Unhandled UI error:', error, info?.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <Container className="flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
        <p className="gv-eyebrow mb-3">Something broke</p>
        <h1 className="text-3xl sm:text-4xl">This page could not be displayed</h1>
        <p className="text-ink-500 mt-4 max-w-md text-sm">
          Reload the page to try again. If the problem persists, please contact Gavora support.
        </p>
        {import.meta.env.DEV && (
          <pre className="bg-canvas-sunken text-danger-700 rounded-control mt-6 max-w-xl overflow-x-auto p-4 text-left text-xs">
            {this.state.message}
          </pre>
        )}
        <Button className="mt-8" onClick={() => window.location.reload()}>
          Reload page
        </Button>
      </Container>
    );
  }
}

export default ErrorBoundary;
