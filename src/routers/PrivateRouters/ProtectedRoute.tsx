import { useContext } from 'react'
import { AppContext } from '../../contexts/app.context'
import { Navigate, Outlet } from 'react-router-dom'
import path from '../../constants/path'

// Này nghĩa là nếu isAuthenticated đúng thì cho vào tiếp render Outlet (những thằng con bên trong) vd như
//cart, user, profile,... còn không thì chuyển hướng về trang login

function ProtectedRoute() {
  const { isAuthenticated } = useContext(AppContext)
  return isAuthenticated ? <Outlet /> : <Navigate to={path.login} replace />
}
export default ProtectedRoute
