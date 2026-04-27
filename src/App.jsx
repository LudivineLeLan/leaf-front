import { Routes, Route, Navigate } from 'react-router-dom'
import SearchPage from '@/pages/SearchPage'
import LibraryPage from '@/pages/LibraryPage'
import StatsPage from '@/pages/StatsPage'
import ProfilePage from '@/pages/ProfilePage'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import BottomNav from '@/components/BottomNav'
import { useLocation } from 'react-router-dom'

const noNavPages = ['/login', '/register'] //no nav menu in those pages

function App() {
  const location = useLocation()
  const showNav = !noNavPages.includes(location.pathname)

  return (
    <div className="min-h-screen pb-16">
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/library" element={<LibraryPage />} />
        <Route path="/stats" element={<StatsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
      {showNav && <BottomNav />}
    </div>
  )
}

export default App;