import PanelPlaceholder from '@/components/common/PanelPlaceholder';

export function Profile() {
  return (
    <PanelPlaceholder
      title="Profile"
      description="Loaded from /api/users/profile once authentication is implemented."
      scope={['Name, email and mobile number', 'Update profile details', 'Change password']}
    />
  );
}

export default Profile;
