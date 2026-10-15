import { useAuth } from './useAuth.jsx';

const PERMISSIONS = {
  admin: ['profile', 'education', 'experience', 'projects', 'messages', 'users'],
  editor: ['profile', 'education', 'experience', 'projects', 'messages'],
  reader: [],
};

export function usePermissions() {
  const { user } = useAuth();

  const role = user?.role || null;

  function can(permission) {
    if (!role) {
      return false;
    }

    const allowed = PERMISSIONS[role] || [];
    return allowed.includes(permission);
  }

  return { role, can };
}

export default usePermissions;
