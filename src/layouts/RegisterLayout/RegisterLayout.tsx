import { memo } from 'react'
import Footer from '../../components/Footer'
import RegisterHeader from '../../components/RegisterHeader'
import { Outlet } from 'react-router-dom'

interface Props {
  children?: React.ReactNode
}

function RegisterLayoutInner({ children }: Props) {
  return (
    <div>
      <RegisterHeader />
      <Outlet />
      {children}
      <Footer />
    </div>
  )
}

const RegisterLayout = memo(RegisterLayoutInner)

export default RegisterLayout
