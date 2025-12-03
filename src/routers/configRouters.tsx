import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import path from '../constants/path'
import MainLayout from '../layouts/MainLayout'
import ProductList from '../pages/ProductList'
import ProductDetail from '../pages/ProductDetail'
import CartLayout from '../layouts/CartLayout'
import Cart from '../pages/Cart'
import UserLayout from '../pages/User/layouts/UserLayout'
import Profile from '../pages/User/pages/Profile'
import ChangePassword from '../pages/User/pages/ChangePassword'
import HistoryPurchase from '../pages/User/pages/HistoryPurchase'
import RegisterLayout from '../layouts/RegisterLayout'
import Login from '../pages/Login'
import Register from '../pages/Register'
import NotFound from '../pages/NotFound'
import ProtectedRoute from './PrivateRouters/ProtectedRoute'
import RejectedRoute from './PrivateRouters/RejectedRoute'

function Routers() {
  const routers = createBrowserRouter([
    {
      // Mặc định sẽ có thể coi được trang sản phẩm
      // xác thực hay chưa đều có thể đứng ở đây
      path: path.home,
      // Thằng này giúp ưu tiên lúc nào vào cũng là nó
      index: true,
      element: (
        <MainLayout>
          <ProductList />
        </MainLayout>
      )
    },
    {
      path: path.productDetail,
      element: (
        <MainLayout>
          <ProductDetail />
        </MainLayout>
      )
    },
    {
      // Nếu xác thực rồi và match vs /profile thì cho vào tiếp
      // không thì back ra /login
      // path: '' = không đổi đường link, chỉ chèn thêm logic bảo vệ.
      path: '',
      element: <ProtectedRoute />,
      // Nested route
      children: [
        // _Match đường dẫn mới render ra element ở dưới
        // Nghĩa là nếu mà thỏa element trên và có muốn vào tiếp nữa mà đường dẫn matches path thì
        // sẽ đi render ra được Profile luôn. Còn không thì phải về lại login
        // _Khi login vao roi thi moi cho vao trang cart
        {
          path: path.cart,
          element: (
            <CartLayout>
              <Cart />
            </CartLayout>
          )
        },
        // *Nested route: xài riêng biệt cho thằng route user/...children chứ nếu khai báo hết thì nhìn nó
        //dài dòng quá
        //Mình sẽ xài element nghĩa là có dùng <outlet/> thay vì sử dụng children
        //chứ không cần đặt cái page con ở giữa
        {
          path: path.user,
          element: (
            <MainLayout>
              <UserLayout />
            </MainLayout>
          ),
          // Nghĩa là nếu thằng path nào mà match trên url thì nó sẽ đưa component đó thay thế cho outlet
          //ở bên trong UserLayout
          children: [
            {
              path: path.profile,
              element: <Profile />
            },
            {
              path: path.changePassword,
              element: <ChangePassword />
            },
            {
              path: path.historyPurchase,
              element: <HistoryPurchase />
            }
          ]
        }
      ]
    },
    {
      // Nếu chưa xác thực thì mới cho vào /login hoặc /register
      // còn nếu xác thực rồi thì không cho vào. Cho vào luôn trang sp
      path: '',
      element: <RejectedRoute />,
      children: [
        {
          path: path.login,
          element: (
            <RegisterLayout>
              <Login />
            </RegisterLayout>
          )
        },
        {
          path: path.register,
          element: (
            <RegisterLayout>
              <Register />
            </RegisterLayout>
          )
        }
      ]
    },
    {
      path: '*',
      element: (
        <MainLayout>
          <NotFound />
        </MainLayout>
      )
    }
  ])

  return <RouterProvider router={routers} />
}

export default Routers
