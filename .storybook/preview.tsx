import React from 'react'
import type { Preview } from '@storybook/react-vite'
import '../src/index.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AppProvider } from '../src/contexts/app.context'
import { MemoryRouter } from 'react-router-dom'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      // Để nếu có lỗi access_token hết hạn thì báo lỗi 1 lần thôi
      retry: 0
    }
  }
})

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i
      }
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo'
    }
  },
  decorators: [
    (Story) => (
      <MemoryRouter
        initialEntries={['/users/Điện-Thoại-Vsmart-Active-3-6GB64GB--Hàng-Chính-Hãng-i-60afb2c76ef5b902180aacba']}
      >
        <QueryClientProvider client={queryClient}>
          <AppProvider>
            <Story />
          </AppProvider>
        </QueryClientProvider>
      </MemoryRouter>
    )
  ]
}

//**Có một lưu ý nhỏ là dù mình xài RouterProvider(cách mới)
//thì khi test storybook vẫn phải bọc BrowserRouter như bình thường
//để tránh nó không sử dụng được các thẻ Link, NavLink trong storybook, hoặc các hooks như useNavigate, useLocation

export default preview
