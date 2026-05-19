import { Routes, Route, NavLink, Navigate } from 'react-router-dom'
import { CalendarDays, ShoppingCart, History, BookOpen } from 'lucide-react'
import ThisWeekView from './views/ThisWeekView'
import ShoppingView from './views/ShoppingView'
import PastWeeksView from './views/PastWeeksView'
import LibraryView from './views/LibraryView'
import CreateRecipeView from './views/CreateRecipeView'

const navItems = [
  { to: '/week', icon: <CalendarDays size={22} />, label: 'This Week' },
  { to: '/library', icon: <BookOpen size={22} />, label: 'Library' },
  { to: '/shopping', icon: <ShoppingCart size={22} />, label: 'Shopping' },
  { to: '/past', icon: <History size={22} />, label: 'Past Weeks' },
]

export default function App() {
  return (
    <div style={shell.app}>
      <div style={shell.content}>
        <Routes>
          <Route path="/" element={<Navigate to="/week" replace />} />
          <Route path="/week" element={<ThisWeekView />} />
          <Route path="/library" element={<LibraryView />} />
          <Route path="/shopping" element={<ShoppingView />} />
          <Route path="/past" element={<PastWeeksView />} />
          <Route path="/create" element={<CreateRecipeView />} />
        </Routes>
      </div>
      <nav style={shell.nav}>
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            style={({ isActive }) => ({ ...shell.navItem, color: isActive ? '#f97316' : '#6b7280' })}
          >
            {item.icon}
            <span style={shell.navLabel}>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

const shell: Record<string, React.CSSProperties> = {
  app: { display: 'flex', flexDirection: 'column', height: '100dvh', background: '#111827' },
  content: { flex: 1, overflowY: 'auto' },
  nav: {
    display: 'flex', justifyContent: 'space-around', alignItems: 'center',
    background: '#1f2937', borderTop: '1px solid #374151',
    padding: '8px 0 max(8px, env(safe-area-inset-bottom))',
    flexShrink: 0,
  },
  navItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', textDecoration: 'none', padding: '6px 8px' },
  navLabel: { fontSize: '10px', fontWeight: 500 },
}
