import { Routes, Route, Navigate } from 'react-router-dom'
import SearchPage from '@/pages/SearchPage'
import LibraryPage from '@/pages/LibraryPage'
import StatsPage from '@/pages/StatsPage'
import ProfilePage from '@/pages/ProfilePage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/search" />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/library" element={<LibraryPage />} />
      <Route path="/stats" element={<StatsPage />} />
      <Route path="/profile" element={<ProfilePage />} />
    </Routes>
  )
}

export default App;