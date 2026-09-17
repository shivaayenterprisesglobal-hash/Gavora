/**
 * Demo account content — UI placeholder data only. See ./README.md.
 *
 * Used to design the account dashboard, order history and address book before
 * /api/users and /api/orders exist. Shaped to match server/src/models/User.js
 * and server/src/models/Order.js.
 *
 * Contact details are deliberately non-real: the numbers use the 99999 test
 * range and addresses are generic.
 */

export const demoProfile = {
  name: 'Demo Customer',
  email: 'demo.customer@example.com',
  phone: '9999900001',
  createdAt: '2026-02-14T09:20:00.000Z',
};

export const demoAddresses = [
  {
    _id: 'addr-1',
    label: 'home',
    fullName: 'Demo Customer',
    phone: '9999900001',
    line1: '14, Second Floor, Sample Residency',
    line2: 'Example Layout',
    landmark: 'Near the community park',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560001',
    country: 'India',
    isDefault: true,
  },
  {
    _id: 'addr-2',
    label: 'work',
    fullName: 'Demo Customer',
    phone: '9999900002',
    line1: 'Unit 402, Placeholder Tech Park',
    line2: 'Block C',
    landmark: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560103',
    country: 'India',
    isDefault: false,
  },
];

export const demoOrders = [
  {
    orderNumber: 'GV-20260901-0042',
    createdAt: '2026-09-01T11:05:00.000Z',
    orderStatus: 'delivered',
    paymentStatus: 'paid',
    paymentMethod: 'online',
    deliveredAt: '2026-09-04T16:40:00.000Z',
    items: [
      { product: 'p-006', name: 'Cast Iron Skillet 26cm', sku: 'GV-HMK-2002', slug: 'cast-iron-skillet-26cm', unitPrice: 2599, quantity: 1, lineTotal: 2599 },
      { product: 'p-025', name: 'Hardbound Dotted Notebook', sku: 'GV-STN-7001', slug: 'hardbound-dotted-notebook', unitPrice: 679, quantity: 2, lineTotal: 1358 },
    ],
    address: 'addr-1',
    subtotal: 3957,
    discount: 0,
    shipping: 0,
    total: 3957,
  },
  {
    orderNumber: 'GV-20260826-0031',
    createdAt: '2026-08-26T18:22:00.000Z',
    orderStatus: 'shipped',
    paymentStatus: 'pending',
    paymentMethod: 'cod',
    deliveredAt: null,
    items: [
      { product: 'p-021', name: 'Waxed Canvas Weekender', sku: 'GV-BAG-6001', slug: 'waxed-canvas-weekender', unitPrice: 4999, quantity: 1, lineTotal: 4999 },
    ],
    address: 'addr-2',
    subtotal: 4999,
    discount: 0,
    shipping: 0,
    total: 4999,
  },
  {
    orderNumber: 'GV-20260812-0019',
    createdAt: '2026-08-12T08:15:00.000Z',
    orderStatus: 'cancelled',
    paymentStatus: 'refunded',
    paymentMethod: 'online',
    deliveredAt: null,
    items: [
      { product: 'p-010', name: 'Kundan Statement Necklace', sku: 'GV-JWL-3002', slug: 'kundan-statement-necklace', unitPrice: 6499, quantity: 1, lineTotal: 6499 },
    ],
    address: 'addr-1',
    subtotal: 6499,
    discount: 500,
    shipping: 0,
    total: 5999,
  },
];
