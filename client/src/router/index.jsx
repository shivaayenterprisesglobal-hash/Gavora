import { createBrowserRouter } from 'react-router-dom';

import ScrollToTop from '@/components/common/ScrollToTop';
import RequireAdmin from '@/components/auth/RequireAdmin';
import RequireAuth from '@/components/auth/RequireAuth';
import AdminLayout from '@/layouts/AdminLayout';
import AuthLayout from '@/layouts/AuthLayout';
import PublicLayout from '@/layouts/PublicLayout';
import Cart from '@/pages/Cart';
import Checkout from '@/pages/Checkout';
import Home from '@/pages/Home';
import NotFound from '@/pages/NotFound';
import OrderConfirmation from '@/pages/OrderConfirmation';
import ProductDetails from '@/pages/ProductDetails';
import Shop from '@/pages/Shop';
import Wishlist from '@/pages/Wishlist';
import AccountLayout from '@/pages/account/AccountLayout';
import Addresses from '@/pages/account/Addresses';
import OrderDetails from '@/pages/account/OrderDetails';
import Orders from '@/pages/account/Orders';
import Profile from '@/pages/account/Profile';
import AdminLogin from '@/pages/admin/AdminLogin';
import AdminCategories from '@/pages/admin/Categories';
import AdminCustomerDetails from '@/pages/admin/CustomerDetails';
import AdminCustomers from '@/pages/admin/Customers';
import AdminDashboard from '@/pages/admin/Dashboard';
import AdminOrderDetails from '@/pages/admin/OrderDetails';
import AdminOrders from '@/pages/admin/Orders';
import AdminPayments from '@/pages/admin/Payments';
import AdminProductEditor from '@/pages/admin/ProductEditor';
import AdminProducts from '@/pages/admin/Products';
import AdminSettings from '@/pages/admin/Settings';
import Login from '@/pages/auth/Login';
import Signup from '@/pages/auth/Signup';
import Privacy from '@/pages/legal/Privacy';
import ReturnsPolicy from '@/pages/legal/ReturnsPolicy';
import ShippingPolicy from '@/pages/legal/ShippingPolicy';
import Terms from '@/pages/legal/Terms';

/**
 * Route table for the whole app.
 *
 * Customer account routes require a signed-in session. Admin routes require an
 * admin role loaded from the server — a customer session cannot open them.
 */
export const router = createBrowserRouter([
  {
    element: (
      <>
        <ScrollToTop />
        <PublicLayout />
      </>
    ),
    children: [
      { index: true, element: <Home /> },
      { path: 'shop', element: <Shop /> },
      { path: 'product/:slug', element: <ProductDetails /> },
      { path: 'cart', element: <Cart /> },
      {
        path: 'checkout',
        element: (
          <RequireAuth>
            <Checkout />
          </RequireAuth>
        ),
      },
      { path: 'wishlist', element: <Wishlist /> },
      {
        path: 'order/:orderNumber',
        element: (
          <RequireAuth>
            <OrderConfirmation />
          </RequireAuth>
        ),
      },
      { path: 'privacy', element: <Privacy /> },
      { path: 'terms', element: <Terms /> },
      { path: 'shipping-policy', element: <ShippingPolicy /> },
      { path: 'returns-policy', element: <ReturnsPolicy /> },
      {
        path: 'account',
        element: (
          <RequireAuth>
            <AccountLayout />
          </RequireAuth>
        ),
        children: [
          { index: true, element: <Profile /> },
          { path: 'addresses', element: <Addresses /> },
          { path: 'orders', element: <Orders /> },
          { path: 'orders/:orderNumber', element: <OrderDetails /> },
        ],
      },
      { path: '*', element: <NotFound /> },
    ],
  },
  {
    element: (
      <>
        <ScrollToTop />
        <AuthLayout />
      </>
    ),
    children: [
      { path: 'login', element: <Login /> },
      { path: 'signup', element: <Signup /> },
    ],
  },
  { path: '/admin/login', element: <AdminLogin /> },
  {
    path: '/admin',
    element: (
      <>
        <ScrollToTop />
        <RequireAdmin>
          <AdminLayout />
        </RequireAdmin>
      </>
    ),
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: 'products', element: <AdminProducts /> },
      { path: 'products/new', element: <AdminProductEditor /> },
      { path: 'products/:id', element: <AdminProductEditor /> },
      { path: 'categories', element: <AdminCategories /> },
      { path: 'orders', element: <AdminOrders /> },
      { path: 'orders/:id', element: <AdminOrderDetails /> },
      { path: 'customers', element: <AdminCustomers /> },
      { path: 'customers/:id', element: <AdminCustomerDetails /> },
      { path: 'payments', element: <AdminPayments /> },
      { path: 'settings', element: <AdminSettings /> },
    ],
  },
]);

export default router;
