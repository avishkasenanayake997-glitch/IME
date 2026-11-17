export const ROLES = {
  superadmin: 'Super Admin',
  owner: 'Business Owner',
  manager: 'Manager',
  cashier: 'Cashier',
  staff: 'Staff',
};

// Module access
export const MODULE_ACCESS = {
  dashboard: ['superadmin', 'owner', 'manager', 'cashier', 'staff'],
  pos: ['superadmin', 'owner', 'manager', 'cashier'],
  sales: ['superadmin', 'owner', 'manager', 'cashier'],
  inventory: ['superadmin', 'owner', 'manager', 'staff'],
  customers: ['superadmin', 'owner', 'manager', 'cashier'],
  employees: ['superadmin', 'owner'],
  reports: ['superadmin', 'owner', 'manager'],
  insights: ['superadmin', 'owner', 'manager'],
  branches: ['superadmin', 'owner'],
  notifications: ['superadmin', 'owner', 'manager', 'cashier', 'staff'],
  settings: ['superadmin', 'owner'],
};

// Fine-grained action permissions
export const ACTIONS = {
  'product.write': ['superadmin', 'owner', 'manager'],
  'product.delete': ['superadmin', 'owner', 'manager'],
  'stock.adjust': ['superadmin', 'owner', 'manager', 'staff'],
  'customer.write': ['superadmin', 'owner', 'manager', 'cashier'],
  'customer.delete': ['superadmin', 'owner', 'manager'],
  'sale.return': ['superadmin', 'owner', 'manager'],
  'employee.write': ['superadmin', 'owner'],
  'branch.write': ['superadmin', 'owner'],
  'settings.write': ['superadmin', 'owner'],
  'backup.run': ['superadmin', 'owner'],
  'dashboard.financials': ['superadmin', 'owner', 'manager'],
};

export const canAccess = (role, module) => !!MODULE_ACCESS[module]?.includes(role);
export const can = (role, action) => !!ACTIONS[action]?.includes(role);
// Roles an acting user is allowed to assign
export const assignableRoles = (role) => (role === 'superadmin' ? Object.keys(ROLES) : Object.keys(ROLES).filter((r) => r !== 'superadmin'));
