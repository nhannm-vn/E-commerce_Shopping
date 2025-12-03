import { User } from '../types/user.type'

// demo event target
export const LocalStorageEventTarget = new EventTarget()

export const setAccessTokenToLS = (access_token: string) => {
  localStorage.setItem('access_token', access_token)
}

export const setRefreshTokenToLS = (refresh_token: string) => {
  localStorage.setItem('refresh_token', refresh_token)
}

export const clearLS = () => {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('profile')
  // Khi chạy hàm clearLS đồng thời sẽ tạo ra thêm một sự kiện clearLS
  const clearLSEvent = new Event('clearLS')
  // Sau đó sẽ dispatch (phát) sự kiện đó ra ngoài => lúc này sẽ qua bên App toàn cục lắng nghe sự kiện này và thực hiện hàm reset
  LocalStorageEventTarget.dispatchEvent(clearLSEvent)
}

export const getAccessTokenFromLS = () => localStorage.getItem('access_token') || ''
export const getRefreshTokenFromLS = () => localStorage.getItem('refresh_token') || ''
// Lưu ý vì những thằng này là object nên cần biến đổi trước khi lây về hoặc đưa lên LS
export const getProfileFromLS = () => {
  const result = localStorage.getItem('profile')
  return result ? JSON.parse(result) : null
}

export const setProfileToLS = (profile: User) => {
  localStorage.setItem('profile', JSON.stringify(profile))
}
