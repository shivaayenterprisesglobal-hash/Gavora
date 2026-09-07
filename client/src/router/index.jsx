import { createBrowserRouter } from 'react-router-dom';

import ScrollToTop from '@/components/common/ScrollToTop';
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
import AccountLayout from '@/pages/account/AccountLayout';
import Addresses from '@/pages/account/Addresses';
import Orders from '@/pages/account/Orders';
import Profile from '@/pages/account/Profile';
import AdminLogin from '@/pages/admin/AdminLogin';
import AdminCategories from '@/pages/admin/Categories';
import AdminCustomers from '@/pages/admin/Customers';
import AdminDashboard from '@/pages/admin/Dashboard';
import AdminOrders from '@/pages/admin/Orders';
import AdminPayments from '@/pages/admin/Payments';
import AdminProducts from '@/pages/admin/Products';
import AdminSettings from '@/pages/admin/Settings';
import Login from '@/pages/auth/Login';
import Signup from '@/pages/auth/Signup';

/**
 * Route table for the whole app.
 *
 * `/account/*`, `/checkout` and `/admin/*` are the routes that will be wrapped
 * in route guards during the authentication phase — customer guards for the
 * first two, an admin role guard for the third.
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
      { path: 'checkout', element: <Checkout /> },
      { path: 'order/:orderNumber', element: <OrderConfirmation /> },
      {
        path: 'account',
        element: <AccountLayout />,
        children: [
          { index: true, element: <Profile /> },
          { path: 'addresses', element: <Addresses /> },
          { path: 'orders', element: <Orders /> },
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
        <AdminLayout />
      </>
    ),
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: 'products', element: <AdminProducts /> },
      { path: 'categories', element: <AdminCategories /> },
      { path: 'orders', element: <AdminOrders /> },
      { path: 'customers', element: <AdminCustomers /> },
      { path: 'payments', element: <AdminPayments /> },
      { path: 'settings', element: <AdminSettings /> },
    ],
  },
]);

export default router;
