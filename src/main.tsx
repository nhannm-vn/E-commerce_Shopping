import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AppProvider } from './contexts/app.context'
import ErrorBoundary from './components/ErrorBoundary'
//import như này thì mới chạy được
import './i18n/i18n'

//BrowserRouter: bọc app vào để chia route

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      // Để nếu có lỗi access_token hết hạn thì báo lỗi 1 lần thôi
      retry: 0
    }
  }
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </AppProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>
)
