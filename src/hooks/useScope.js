import { useAuth, useBranch } from '../context/AppContext';

// Owner-level roles may view any branch; everyone else is scoped to their assigned branch.
export function useScope() {
  const { user } = useAuth();
  const { branchId } = useBranch();
  const all = user.role === 'superadmin' || user.role === 'owner';
  return { branchId: all ? branchId : user.branchId, canSwitch: all };
}
