import type { StaffRole } from './database.types'

export const ROLE_LABELS: Record<StaffRole, string> = {
  owner: 'Administrator',
  location_manager: 'Manager locație',
  head_chef: 'Șef bucătărie',
  shift_lead: 'Șef tură',
  kitchen_manager: 'Manager centru producție',
  production_staff: 'Producție',
  marketing: 'Marketing',
}

// Ordinea în care apar rolurile în listele de alegere.
export const ROLE_ORDER: StaffRole[] = [
  'owner',
  'location_manager',
  'head_chef',
  'shift_lead',
  'kitchen_manager',
  'production_staff',
  'marketing',
]

// Rolurile legate de o singură locație (Drunken Rat sau Astur): văd doar locația lor
// și trebuie să aibă obligatoriu o locație (regulă și în baza de date).
export const LOCATION_ROLES: StaffRole[] = ['location_manager', 'head_chef', 'shift_lead']

export function isLocationRole(role: StaffRole | undefined | null): boolean {
  return !!role && LOCATION_ROLES.includes(role)
}
