// Chứa những file hoặc interface liên quan đến việc login hoặc register
// nghĩa là liên quan đến phần authentication

import { User } from './user.type'
import { SuccessResponse } from './utils.type'

// ResponseApi là interface bao đóng cho tổng thể sẽ có 2 thằng chính là message và data
// AuthResponse là kiểu dữ liệu mà server  trả về cụ thể cho register/login luôn
export type AuthResponse = SuccessResponse<{
  access_token: string
  refresh_token: string
  expires_refresh_token: number
  expires: number
  user: User
}>
