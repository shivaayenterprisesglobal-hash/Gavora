import PagePlaceholder from '@/components/common/PagePlaceholder';

export function Cart() {
  return (
    <PagePlaceholder
      eyebrow="Cart"
      title="Your cart"
      description="Cart state is held client-side, then revalidated and re-priced server-side at checkout."
      scope={[
        'Cart line items',
        'Quantity updates',
        'Remove item',
        'Subtotal',
        'Discount',
        'Shipping',
        'Order total',
      ]}
    />
  );
}

export default Cart;
