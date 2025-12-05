import { memo } from 'react'
import Footer from '../../components/Footer'
import Header from '../../components/Header'
import { Outlet } from 'react-router-dom'

interface Props {
  children?: React.ReactNode
}

function MainLayoutInner({ children }: Props) {
  return (
    <div>
      <Header />
      <Outlet />
      {children}
      <Footer />
    </div>
  )
}

const MainLayout = memo(MainLayoutInner)

export default MainLayout
