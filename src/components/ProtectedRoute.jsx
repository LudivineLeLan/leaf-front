import { Navigate } from 'react-router-dom'

function ProtectedRoute({ children }) {
  const token = document.cookie.includes('token')

  if (!token) {
    return <Navigate to="/login" />
  }

  return children
}

export default ProtectedRoute