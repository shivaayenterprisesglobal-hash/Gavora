import { RouterProvider } from 'react-router-dom';

import ErrorBoundary from '@/components/common/ErrorBoundary';
import AuthProvider from '@/context/AuthProvider';
import CartProvider from '@/context/CartProvider';
import ToastProvider from '@/context/ToastProvider';
import WishlistProvider from '@/context/WishlistProvider';
import router from '@/router';

export function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <WishlistProvider>
            <CartProvider>
              <RouterProvider router={router} />
            </CartProvider>
          </WishlistProvider>
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
