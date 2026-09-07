import PanelPlaceholder from '@/components/common/PanelPlaceholder';

export function Addresses() {
  return (
    <PanelPlaceholder
      title="Saved addresses"
      description="Addresses are stored on the user document and reused at checkout."
      scope={['List saved addresses', 'Add an address', 'Edit an address', 'Delete an address', 'Set a default address']}
    />
  );
}

export default Addresses;
