import { useContext, useEffect } from 'react'
import { ToastContainer } from 'react-toastify'
import { AppContext } from './contexts/app.context'
import { LocalStorageEventTarget } from './utils/auth'
import Routers from './routers/configRouters'

function App() {
  const { reset } = useContext(AppContext)
  // Khi chúng ta lắng nghe một sự kiện thì phải để nó trong useEffect
  // *Khi sự kiện clearLS được phát ra khi hàm clearLS được gọi để logout và xóa token khỏi localStorage
  //thì App sẽ lắng nghe sự kiện đó và tiến hành gọi hàm reset để reset lại toàn bộ trạng thái trong AppContext
  //và reset này là sẽ reset các thông tin liên quan đến người dùng đã đăng nhập và purchase, và isAuthenticated
  useEffect(() => {
    LocalStorageEventTarget.addEventListener('clearLS', reset)
    return () => {
      LocalStorageEventTarget.removeEventListener('clearLS', reset)
    }
  }, [reset])
  return (
    <div>
      <Routers />
      <ToastContainer />
    </div>
  )
}

export default App
