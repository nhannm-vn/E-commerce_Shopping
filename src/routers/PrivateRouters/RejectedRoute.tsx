import { useContext } from 'react'
import { AppContext } from '../../contexts/app.context'
import { Navigate, Outlet } from 'react-router-dom'
import path from '../../constants/path'

// Nghĩa là nếu đã đăng nhập và isAuthenticated = true thì không cho về(back) trang login hoặc register nữa
//còn nếu isAuthenticated = false thì cho vào các trang như login, register

function RejectedRoute() {
  const { isAuthenticated } = useContext(AppContext)
  return !isAuthenticated ? <Outlet /> : <Navigate to={path.home} replace />
}

export default RejectedRoute
