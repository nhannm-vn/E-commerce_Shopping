// file chuyên dùng để config axios
import axios, { AxiosError, AxiosInstance } from 'axios'
import HttpStatusCode from '../constants/httpStatusCode.enum'
import { toast } from 'react-toastify'
import { AuthResponse } from '../types/auth.type'
import {
  clearLS,
  getAccessTokenFromLS,
  getRefreshTokenFromLS,
  setAccessTokenToLS,
  setProfileToLS,
  setRefreshTokenToLS
} from './auth'
import path from '../constants/path'
import config from '../constants/config'

//keeptrying
class Http {
  instance: AxiosInstance
  // Dùng để lưu token khi login thành công phục vụ cho các route cần authentication
  private accessToken: string
  // Dùng để lưu refreshToken khi login thành công phục vụ cho các route cần authentication
  private refreshToken: string
  // Dùng để tránh việc gọi nhiều lần hàm refreshToken
  private refreshTokenRequest: Promise<string> | null
  constructor() {
    this.accessToken = getAccessTokenFromLS()
    this.refreshToken = getRefreshTokenFromLS()
    this.instance = axios.create({
      baseURL: config.baseUrl,
      timeout: 1000,
      headers: {
        'Content-Type': 'application/json',
        'expire-access-token': 10, // 10s
        'expire-refresh-token': 60 * 60 // 1h
      }
    })
    // Xử lí cho các request yêu cầu access_token
    this.instance.interceptors.request.use(
      (config) => {
        // Nếu có accessToken thì gáng vào headers còn rôi đã trả không thì cứ trả như bthg
        if (this.accessToken && config.headers) {
          config.headers.Authorization = this.accessToken
          return config
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )
    // Add a response interceptor
    this.instance.interceptors.response.use(
      (response) => {
        const data = response.data as AuthResponse
        const { url } = response.config
        // Khi login hoac register thanh cong thi luu token vao LS
        if (url === path.login || url === path.register || url === 'login' || url === 'register') {
          // Lưu ý phải đổi thành arrow thì mới thấy this
          this.accessToken = data.data.access_token
          // Sau khi login nhận được token thì tiến hành set vào prop
          this.refreshToken = data.data.refresh_token
          // Tiến hành lưu token  vào localStorage
          setAccessTokenToLS(this.accessToken)
          setRefreshTokenToLS(this.refreshToken)
          setProfileToLS(data.data.user)
        } else if (url === path.logout || url === 'logout') {
          // Khi logout thi se xoa
          this.accessToken = ''
          this.refreshToken = ''
          clearLS()
        }
        return response
      },
      // Nếu có lỗi thì nó sẽ nhảy vào khu vực này
      function (error: AxiosError) {
        // Các lỗi khác thì sẽ là object theo back-end quy định
        // Tuy nhiên đây là trường hợp các lỗi còn lại thì nó sẽ chỉ có message do axios render
        // Nghĩa là lỗi này sẽ khác với lỗi mã 422
        if (error.response?.status !== HttpStatusCode.UnprocessableEntity) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const data: any | undefined = error.response?.data
          // Nếu mà trong data không có message thì hãy hãy message ở ngoài error luôn đi
          const message = data?.message || error.message
          toast.error(message)
        }
        // Nếu có lỗi 401 nghĩa là có lỗi hết hạn access_token
        if (error.response?.status === HttpStatusCode.Unauthorized) {
          // Khi đấy thì mình sẽ xóa localStorage
          clearLS()
          // Mình phải refresh thì context sẽ lấy ra thì lúc này sẽ hoàn chỉnh
          // window.location.reload()
          //**Nếu xài cách này thì page sẽ refresh thêm 1 lần nó sẽ không hay
          //==> cách khắc phục dùng event target đồng thời dùng hàm reset chuyển về default cho các thành
          //phần trong context
        }
        return Promise.reject(error)
      }
    )
  }
}

const http = new Http().instance

export default http
