import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthContext'
import { isLocationRole } from '../lib/roles'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-2 text-sm font-medium rounded-md ${
    isActive ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'
  }`

export function Layout() {
  const { profile, signOut } = useAuth()
  const locationRole = isLocationRole(profile?.role)

  return (
    <div className="min-h-svh bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <nav className="flex flex-wrap gap-1">
            {profile?.role === 'owner' && <NavLink to="/" end className={linkClass}>Dashboard</NavLink>}
            {locationRole && <NavLink to="/" end className={linkClass}>Locația mea</NavLink>}
            {profile?.role !== 'marketing' && (
              <>
                <NavLink to="/recipes" className={linkClass}>Rețete</NavLink>
                {/* Șeful de bucătărie produce la locația lui; managerul și șeful de tură nu. */}
                {(!locationRole || profile?.role === 'head_chef') && (
                  <NavLink to="/production" className={linkClass}>Producție</NavLink>
                )}
                <NavLink to="/stock" className={linkClass}>Stoc</NavLink>
              </>
            )}
            {(profile?.role === 'owner' || profile?.role === 'location_manager') && (
              <NavLink to="/echipa" className={linkClass}>Echipa</NavLink>
            )}
            {(profile?.role === 'owner' || profile?.role === 'marketing') && <NavLink to="/marketing" className={linkClass}>Marketing</NavLink>}
            {/* Reforma: doar administratorii. Conține salarii și bani fără documente. */}
            {profile?.role === 'owner' && <NavLink to="/reforma" className={linkClass}>Reforma</NavLink>}
          </nav>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">{profile?.name}</span>
            <button
              type="button"
              onClick={() => void signOut()}
              className="text-sm font-medium text-gray-500 hover:text-gray-900"
            >
              Ieșire
            </button>
          </div>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  )
}
