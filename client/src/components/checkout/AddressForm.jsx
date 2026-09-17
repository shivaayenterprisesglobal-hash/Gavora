import { ADDRESS_LABELS, INDIAN_STATES } from '@/data/regions';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';

const EMPTY = {
  label: 'home',
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

/**
 * Delivery address fields shared by checkout and the account address book.
 *
 * Validation of PIN code and phone is the same pattern the server will enforce;
 * the form surfaces it immediately so a round-trip is not required to find a
 * mistyped PIN.
 */
export function AddressForm({ value, onChange, errors = {}, idPrefix = 'address' }) {
  const address = { ...EMPTY, ...value };

  const set = (field) => (event) => onChange({ ...address, [field]: event.target.value });

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Select
        id={`${idPrefix}-label`}
        label="Address type"
        name="label"
        value={address.label}
        onChange={set('label')}
        options={ADDRESS_LABELS}
      />

      <Input
        id={`${idPrefix}-fullName`}
        label="Full name"
        name="fullName"
        autoComplete="name"
        required
        value={address.fullName}
        onChange={set('fullName')}
        error={errors.fullName}
      />

      <Input
        id={`${idPrefix}-phone`}
        label="Mobile number"
        name="phone"
        type="tel"
        inputMode="numeric"
        autoComplete="tel"
        required
        hint="10-digit Indian mobile number"
        value={address.phone}
        onChange={set('phone')}
        error={errors.phone}
      />

      <Input
        id={`${idPrefix}-pincode`}
        label="PIN code"
        name="pincode"
        inputMode="numeric"
        autoComplete="postal-code"
        required
        value={address.pincode}
        onChange={set('pincode')}
        error={errors.pincode}
      />

      <Input
        id={`${idPrefix}-line1`}
        label="Address line 1"
        name="line1"
        autoComplete="address-line1"
        required
        className="sm:col-span-2"
        value={address.line1}
        onChange={set('line1')}
        error={errors.line1}
      />

      <Input
        id={`${idPrefix}-line2`}
        label="Address line 2"
        name="line2"
        autoComplete="address-line2"
        className="sm:col-span-2"
        value={address.line2}
        onChange={set('line2')}
      />

      <Input
        id={`${idPrefix}-landmark`}
        label="Landmark"
        name="landmark"
        className="sm:col-span-2"
        value={address.landmark}
        onChange={set('landmark')}
      />

      <Input
        id={`${idPrefix}-city`}
        label="City"
        name="city"
        autoComplete="address-level2"
        required
        value={address.city}
        onChange={set('city')}
        error={errors.city}
      />

      <Select
        id={`${idPrefix}-state`}
        label="State"
        name="state"
        autoComplete="address-level1"
        required
        value={address.state}
        onChange={set('state')}
        error={errors.state}
        options={[{ value: '', label: 'Select a state' }, ...INDIAN_STATES.map((state) => ({ value: state, label: state }))]}
      />
    </div>
  );
}

export default AddressForm;
