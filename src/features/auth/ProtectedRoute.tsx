import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './AuthContext'
import type { StaffRole } from '../../lib/database.types'

export function ProtectedRoute({ allowedRoles }: { allowedRoles?: StaffRole[] }) {
  const { session, profile, loading } = useAuth()

  if (loading) return <div className="p-6 text-center text-gray-500">Se încarcă...</div>
  if (!session) return <Navigate to="/login" replace />
  if (!profile) return <div className="p-6 text-center text-gray-500">Se încarcă profilul...</div>
  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
