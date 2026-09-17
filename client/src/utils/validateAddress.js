export function validateAddress(address) {
  const errors = {};

  if (!address.fullName?.trim() || address.fullName.trim().length < 2) {
    errors.fullName = 'Enter the recipient’s name';
  }
  if (!/^[6-9]\d{9}$/.test(String(address.phone ?? '').trim())) {
    errors.phone = 'Enter a valid 10-digit Indian mobile number';
  }
  if (!address.line1?.trim()) {
    errors.line1 = 'Enter address line 1';
  }
  if (!address.city?.trim()) {
    errors.city = 'Enter a city';
  }
  if (!address.state) {
    errors.state = 'Select a state';
  }
  if (!/^[1-9]\d{5}$/.test(String(address.pincode ?? '').trim())) {
    errors.pincode = 'Enter a valid 6-digit PIN code';
  }

  return errors;
}
