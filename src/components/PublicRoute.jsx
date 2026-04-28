import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

function PublicRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) return null

  if (user) return <Navigate to="/search" />

  return children
}

export default PublicRoute