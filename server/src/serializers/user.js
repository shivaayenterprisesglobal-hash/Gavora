export function toSafeUser(user) {
  if (!user) return null;
  const json = typeof user.toJSON === 'function' ? user.toJSON() : user;
  return {
    _id: json._id ?? json.id,
    name: json.name,
    email: json.email,
    phone: json.phone ?? '',
    role: json.role,
    createdAt: json.createdAt,
    updatedAt: json.updatedAt,
  };
}

export function toSafeAddress(address) {
  if (!address) return null;
  const json = typeof address.toJSON === 'function' ? address.toJSON() : address;
  return {
    _id: json._id ?? json.id,
    label: json.label,
    fullName: json.fullName,
    phone: json.phone,
    line1: json.line1,
    line2: json.line2 ?? '',
    landmark: json.landmark ?? '',
    city: json.city,
    state: json.state,
    pincode: json.pincode,
    country: json.country ?? 'India',
    isDefault: Boolean(json.isDefault),
  };
}
