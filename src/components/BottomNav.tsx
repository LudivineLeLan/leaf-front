import { Link, useLocation } from 'react-router-dom'
import { Search, BookOpen, BarChart2, User } from 'lucide-react'

const navItems = [
  { path: '/search', icon: Search, label: 'Recherche' },
  { path: '/library', icon: BookOpen, label: 'Bibliothèque' },
  { path: '/stats', icon: BarChart2, label: 'Statistiques' },
  { path: '/profile', icon: User, label: 'Profil' },
]

function BottomNav() {
  const location = useLocation()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center h-16 z-50">
      {navItems.map(({ path, icon: Icon, label }) => {
        const isActive = location.pathname === path
        return (
          <Link
            key={path}
            to={path}
            className={`flex flex-col items-center gap-1 text-xs transition-colors ${
              isActive ? 'text-green-600' : 'text-gray-400'
            }`}
          >
            <Icon size={22} />
            <span>{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

export default BottomNav