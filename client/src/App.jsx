import { RouterProvider } from 'react-router-dom';

import ErrorBoundary from '@/components/common/ErrorBoundary';
import AuthProvider from '@/context/AuthProvider';
import CartProvider from '@/context/CartProvider';
import router from '@/router';

export function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <CartProvider>
          <RouterProvider router={router} />
        </CartProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
