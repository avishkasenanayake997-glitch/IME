import { store } from './store';
import { uid, validators } from '../utils/format';
import { notificationService } from './notificationService';

export function validateEmployee(e, list, isNew) {
  const err = {};
  if (!e.name?.trim()) err.name = 'Name is required';
  if (!validators.email(e.email)) err.email = 'Enter a valid email';
  else if (list.some((x) => x.id !== e.id && x.email.toLowerCase() === e.email.toLowerCase())) err.email = 'Email already in use';
  if (!validators.phone(e.phone)) err.phone = 'Enter a valid phone number';
  if (!e.position?.trim()) err.position = 'Position is required';
  if (!e.role) err.role = 'Select a role';
  if (isNew && (!e.password || e.password.length < 6)) err.password = 'Password must be at least 6 characters';
  if (!isNew && e.password && e.password.length < 6) err.password = 'Password must be at least 6 characters';
  return err;
}

export const employeeService = {
  list: () => store.get('employees'),
  create(data) {
    const emp = { ...data, id: uid('e') };
    store.update('employees', (l) => [emp, ...l]);
    notificationService.add('employee', 'Employee account created', `${emp.name} (${emp.position}) was added.`);
    return emp;
  },
  update(id, data) {
    store.update('employees', (l) => l.map((e) => (e.id === id ? { ...e, ...data, password: data.password ? data.password : e.password } : e)));
  },
  remove(id) {
    const target = store.get('employees').find((e) => e.id === id);
    if (target?.role === 'superadmin' && store.get('employees').filter((e) => e.role === 'superadmin').length <= 1) throw new Error('Cannot delete the only Super Admin');
    store.update('employees', (l) => l.filter((e) => e.id !== id));
  },
};
