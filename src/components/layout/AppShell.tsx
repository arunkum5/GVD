import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { LogOut, Home, ClipboardList, Settings, PenTool, User as UserIcon, LayoutDashboard, QrCode, MapPin, Phone, MessageCircle } from 'lucide-react'
import { UserRole } from '@/types'

export default function AppShell() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  if (!user) return null

  const getNavItems = (role: UserRole) => {
    switch (role) {
      case 'CUSTOMER':
        return [
          { label: 'Portal', path: '/customer', icon: <Home className="h-5 w-5" /> },
          { label: 'Location', path: '/location', icon: <MapPin className="h-5 w-5" /> },
          { label: 'Call', path: 'call', href: 'tel:9342851128', icon: <Phone className="h-5 w-5" /> },
          { label: 'WhatsApp', path: 'wa', href: 'https://wa.me/919342851128', icon: <MessageCircle className="h-5 w-5" /> }
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
          <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
            <img src="/logo.png" alt="GVD Auto World" className="h-8 w-8 object-contain" />
            GVD Auto
          </h1>
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

        <div className="p-4 border-t border-border">
          <div className="flex items-center space-x-3 mb-4 px-2">
            <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-primary">
              <UserIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{user.role.toLowerCase()}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-card border-b border-border">
          <h1 className="text-xl font-bold text-primary flex items-center gap-2">
            <img src="/logo.png" alt="GVD Auto World" className="h-8 w-8 object-contain" />
            GVD Auto
          </h1>
          <button onClick={handleLogout} className="text-muted-foreground">
            <LogOut className="h-6 w-6" />
          </button>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 md:p-8 safe-bottom md:safe-bottom-0 pb-32 md:pb-8">
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
    </div>
  )
}
