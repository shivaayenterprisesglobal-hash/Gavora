function snapshotAddress(address) {
  if (!address) {
    return {
      fullName: '',
      phone: '',
      line1: '',
      line2: '',
      landmark: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India',
    };
  }

  return {
    fullName: address.fullName,
    phone: address.phone,
    line1: address.line1,
    line2: address.line2 ?? '',
    landmark: address.landmark ?? '',
    city: address.city,
    state: address.state,
    pincode: address.pincode,
    country: address.country ?? 'India',
  };
}

function snapshotItems(items) {
  return (items ?? []).map((item) => ({
    name: item.name,
    sku: item.sku,
    image: item.image ?? '',
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    lineTotal: item.lineTotal,
  }));
}

function entityId(value) {
  if (!value) return value;
  if (typeof value === 'object') return value._id ?? value.id;
  return value;
}

export function toCustomerOrder(order) {
  const json = typeof order.toJSON === 'function' ? order.toJSON() : order;
  const items = json.items ?? [];
  return {
    _id: json._id ?? json.id,
    orderNumber: json.orderNumber,
    items: snapshotItems(items),
    address: snapshotAddress(json.address),
    subtotal: json.subtotal,
    discount: json.discount,
    shipping: json.shipping,
    total: json.total,
    currency: json.currency ?? 'INR',
    paymentMethod: json.paymentMethod,
    paymentStatus: json.paymentStatus,
    orderStatus: json.orderStatus,
    customerNote: json.customerNote ?? '',
    createdAt: json.createdAt,
    updatedAt: json.updatedAt,
    cancelledAt: json.cancelledAt ?? null,
    deliveredAt: json.deliveredAt ?? null,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
  };
}

function toSafeCustomer(user) {
  if (!user) return null;
  const json = typeof user.toJSON === 'function' ? user.toJSON() : user;
  return {
    _id: json._id ?? json.id,
    name: json.name,
    email: json.email,
    phone: json.phone ?? '',
  };
}

export function toAdminOrderSummary(order) {
  const json = typeof order.toJSON === 'function' ? order.toJSON() : order;
  const items = json.items ?? [];
  return {
    _id: json._id ?? json.id,
    orderNumber: json.orderNumber,
    customer: toSafeCustomer(json.customer) ?? { email: json.contactEmail },
    contactEmail: json.contactEmail,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    total: json.total,
    currency: json.currency ?? 'INR',
    paymentMethod: json.paymentMethod,
    paymentStatus: json.paymentStatus,
    orderStatus: json.orderStatus,
    createdAt: json.createdAt,
  };
}

export function toAdminOrder(order) {
  const json = typeof order.toJSON === 'function' ? order.toJSON() : order;
  return {
    ...toAdminOrderSummary(order),
    items: (json.items ?? []).map((item) => ({
      product: entityId(item.product) ?? item.productId ?? item.product,
      name: item.name,
      sku: item.sku,
      image: item.image ?? '',
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      lineTotal: item.lineTotal,
    })),
    address: snapshotAddress(json.address),
    subtotal: json.subtotal,
    discount: json.discount,
    shipping: json.shipping,
    customerNote: json.customerNote ?? '',
    paymentReference: json.paymentReference ?? null,
    statusHistory: (json.statusHistory ?? []).map((event) => ({
      status: event.status,
      note: event.note ?? '',
      changedAt: event.changedAt,
    })),
    cancelledAt: json.cancelledAt ?? null,
    deliveredAt: json.deliveredAt ?? null,
    updatedAt: json.updatedAt,
  };
}
