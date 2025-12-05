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
      path: '',
      element: <MainLayout />,
      children: [
        {
          // Mặc định sẽ có thể coi được trang sản phẩm
          // xác thực hay chưa đều có thể đứng ở đây
          path: path.home,
          // Thằng này giúp ưu tiên lúc nào vào cũng là nó
          index: true,
          element: <ProductList />
        },
        {
          path: path.productDetail,
          element: <ProductDetail />
        },
        {
          path: '*',
          element: <NotFound />
        }
      ]
    },

    // Protected route: chỉ cho phép những người đã xác thực rồi mới vào được
    {
      path: '',
      element: <ProtectedRoute />,
      // Nested route
      children: [
        {
          path: path.cart,
          //*Thằng này xài có duy nhât một cái CartLayout nên thôi không cần thêm outlet vào CartLayout
          //để tối ưu nữa nên viết theo kiểu bọc children luôn
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
          element: <MainLayout />,
          // Nghĩa là nếu thằng path nào mà match trên url thì nó sẽ đưa component đó thay thế cho outlet
          //ở bên trong UserLayout
          children: [
            {
              path: '',
              element: <UserLayout />,
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
        }
      ]
    },
    // Rejected route: chỉ cho phép những người chưa xác thực mới vào được
    {
      path: '',
      // Trong thằng RejectedRoute có sử dụng outlet để chứa các trang con nên không cần thêm
      //outlet vào RegisterLayout nữa
      //***Note: đây là cách setup route có thể đưa oulet vào RegisterLayout mà vẫn giữ outlet trong RejectedRoute
      element: <RejectedRoute />,
      children: [
        {
          path: '',
          element: <RegisterLayout />,
          children: [
            {
              path: path.login,
              element: <Login />
            },
            {
              path: path.register,
              element: <Register />
            }
          ]
        }
      ]
    }
  ])

  return <RouterProvider router={routers} />
}

export default Routers
