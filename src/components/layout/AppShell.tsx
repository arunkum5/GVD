import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { LogOut, Home, ClipboardList, Settings, PenTool, User as UserIcon, LayoutDashboard, QrCode, MapPin, Phone, MessageCircle } from 'lucide-react'
import { UserRole } from '@/types'
import ChangePinModal from '../auth/ChangePinModal'

export default function AppShell() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isPinModalOpen, setIsPinModalOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setIsScrolled(e.currentTarget.scrollTop > 20)
  }

  if (!user) return null

  const getNavItems = (role: UserRole) => {
    switch (role) {
      case 'CUSTOMER':
        return [
          { label: 'Portal', path: '/customer', icon: <Home className="h-6 w-6" /> },
          { label: 'Location', path: '/location', icon: <MapPin className="h-6 w-6" /> },
          { 
            label: '', 
            path: 'call', 
            href: 'tel:9342851128', 
            icon: (
              <div className="h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center shadow-lg text-white transform hover:scale-110 transition-transform">
                <Phone className="h-5 w-5 fill-current" />
              </div>
            )
          },
          { 
            label: '', 
            path: 'wa', 
            href: 'https://wa.me/919342851128?text=Hi!%20GVD%20Auto%20World,%20I%20need%20assistance.', 
            icon: (
              <div className="h-10 w-10 bg-green-500 rounded-full flex items-center justify-center shadow-lg text-white transform hover:scale-110 transition-transform">
                <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
                </svg>
              </div>
            )
          }
        ]
      case 'STAFF':
        return [
          { label: 'Dashboard', path: '/staff', icon: <LayoutDashboard className="h-5 w-5" /> },
          { label: 'New Job', path: '/staff/job-cards/new', icon: <ClipboardList className="h-5 w-5" /> },
          { label: 'Inventory', path: '/admin/inventory', icon: <Settings className="h-5 w-5" /> },
          { label: 'Scanner', path: '/scanner', icon: <QrCode className="h-5 w-5" /> }
        ]
      case 'TECHNICIAN':
        return [
          { label: 'My Jobs', path: '/technician', icon: <PenTool className="h-5 w-5" /> }
        ]
      case 'ADMIN':
        return [
          { label: 'Admin', path: '/admin', icon: <Settings className="h-5 w-5" /> },
          { label: 'Employees', path: '/admin/employees', icon: <UserIcon className="h-5 w-5" /> },
          { label: 'Staff View', path: '/staff', icon: <LayoutDashboard className="h-5 w-5" /> },
          { label: 'Inventory', path: '/admin/inventory', icon: <ClipboardList className="h-5 w-5" /> }
        ]
      default:
        return []
    }
  }

  const navItems = getNavItems(user.role)

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex w-64 flex-col bg-card border-r border-border">
        <div className="p-6">
          <div className="flex items-center">
            <img src="/logo.webp" alt="GVD Auto World" className="h-12 w-auto object-contain" />
          </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            const className = `w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              isActive
                ? 'bg-primary/10 text-primary font-medium'
                : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
            }`

            if (item.href) {
              return (
                <a key={item.path} href={item.href} target="_blank" rel="noreferrer" className={className}>
                  {item.icon}
                  <span>{item.label}</span>
                </a>
              )
            }

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={className}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>

        <div className="p-4 border-t border-border space-y-2">
          <button 
            onClick={() => user.username !== 'admin' && setIsPinModalOpen(true)}
            className={`w-full flex items-center space-x-3 mb-2 px-2 py-2 rounded-lg transition-colors ${user.username !== 'admin' ? 'hover:bg-secondary cursor-pointer' : 'cursor-default'}`}
          >
            <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-primary shrink-0">
              <UserIcon className="h-5 w-5" />
            </div>
            <div className="text-left overflow-hidden">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{user.role.toLowerCase()}</p>
            </div>
          </button>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-2.5 text-rose-500 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-lg transition-all"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-bold tracking-wide">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Mobile Header */}
        <header className={`md:hidden flex items-center justify-between bg-card border-b border-border transition-all duration-300 ${isScrolled ? 'p-2 shadow-md' : 'p-4'}`}>
          <div className="flex items-center gap-3">
            <img src="/logo.webp" alt="GVD Auto World" className={`w-auto object-contain transition-all duration-300 ${isScrolled ? 'h-7' : 'h-10'}`} />
          </div>
          <div className="flex items-center gap-2">
            {user.username !== 'admin' && (
              <button onClick={() => setIsPinModalOpen(true)} className="p-2.5 bg-secondary/50 text-foreground hover:bg-secondary hover:scale-105 active:scale-95 transition-all rounded-full border border-border">
                <UserIcon className={`transition-all duration-300 ${isScrolled ? 'h-4 w-4' : 'h-5 w-5'}`} />
              </button>
            )}
            <button onClick={handleLogout} className="p-2.5 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 hover:scale-105 active:scale-95 transition-all rounded-full border border-rose-500/20">
              <LogOut className={`transition-all duration-300 ${isScrolled ? 'h-4 w-4' : 'h-5 w-5'}`} />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div 
          className="flex-1 overflow-auto p-4 md:p-8 pb-32 md:pb-8"
          onScroll={handleScroll}
        >
          <Outlet />
        </div>

        {/* Mobile Bottom Nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border flex justify-around p-2 safe-bottom z-50">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            const className = `flex flex-col items-center p-2 rounded-lg min-w-[64px] ${
              isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            }`

            if (item.href) {
              return (
                <a key={item.path} href={item.href} target="_blank" rel="noreferrer" className={className}>
                  {item.icon}
                  <span className="text-[10px] mt-1 font-medium">{item.label}</span>
                </a>
              )
            }

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={className}
              >
                {item.icon}
                <span className="text-[10px] mt-1 font-medium">{item.label}</span>
              </button>
            )
          })}
        </nav>
      </main>

      <ChangePinModal isOpen={isPinModalOpen} onClose={() => setIsPinModalOpen(false)} />
    </div>
  )
}
