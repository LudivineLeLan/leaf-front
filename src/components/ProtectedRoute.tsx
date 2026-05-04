import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) return null // ou un spinner

  if (!user) return <Navigate to="/login" />

  return children
}

export default ProtectedRoute