// file chuyên dùng để config axios
import axios, { AxiosError, AxiosInstance } from 'axios'
import { toast } from 'react-toastify'
import { URL_LOGIN, URL_LOGOUT, URL_REFRESH_TOKEN, URL_REGISTER } from '../apis/auth.api'
import config from '../constants/config'
import HttpStatusCode from '../constants/httpStatusCode.enum'
import { AuthResponse, RefreshTokenResponse } from '../types/auth.type'
import { ErrorResponse } from '../types/utils.type'
import {
  clearLS,
  getAccessTokenFromLS,
  getRefreshTokenFromLS,
  setAccessTokenToLS,
  setProfileToLS,
  setRefreshTokenToLS
} from './auth'
import { isAxiosExpiredTokenError, isAxiosUnauthorizedError } from './utils'

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
    this.refreshTokenRequest = null
    this.instance = axios.create({
      baseURL: config.baseUrl,
      timeout: 1000,
      headers: {
        'Content-Type': 'application/json',
        'expire-access-token': 5, // 10s
        'expire-refresh-token': 10 // 1h
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
        if (url === URL_LOGIN || url === URL_REGISTER) {
          // Lưu ý phải đổi thành arrow thì mới thấy this
          this.accessToken = data.data.access_token
          // Sau khi login nhận được token thì tiến hành set vào prop
          this.refreshToken = data.data.refresh_token
          // Tiến hành lưu token  vào localStorage
          setAccessTokenToLS(this.accessToken)
          setRefreshTokenToLS(this.refreshToken)
          setProfileToLS(data.data.user)
        } else if (url === URL_LOGOUT) {
          // Khi logout thi se xoa
          this.accessToken = ''
          this.refreshToken = ''
          clearLS()
        }
        return response
      },
      // Nếu có lỗi thì nó sẽ nhảy vào khu vực này
      //***Lưu ý phải là arrow function thì mới thấy được this
      (error: AxiosError) => {
        // Các lỗi khác thì sẽ là object theo back-end quy định
        // Tuy nhiên đây là trường hợp các lỗi còn lại thì nó sẽ chỉ có message do axios render
        // Nghĩa là lỗi này sẽ khác với lỗi mã 422
        //**Đây sẽ toast những lỗi khác với lỗi 422 và 401
        if (
          ![HttpStatusCode.UnprocessableEntity, HttpStatusCode.Unauthorized].includes(error.response?.status as number)
        ) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const data: any | undefined = error.response?.data
          const message = data?.message || error.message
          toast.error(message)
        }

        // Lỗi unauthorized 401 sẽ có rất nhiều trường hợp:
        // + Token không đúng
        // + Không có token
        // + Token hết hạn

        // Nếu có lỗi 401 nghĩa là có lỗi hết hạn access_token
        if (isAxiosUnauthorizedError<ErrorResponse<{ name: string; message: string }>>(error)) {
          const config = error.response?.config || { headers: {}, url: '' }
          const { url } = config
          // Trường hợp token hết hạn và request đó không phải là request refresh token
          //thì chúng ta mới tiến hành gọi refresh token
          //Note: Nghĩa là những api hết hạn thông thường thì chúng ta tiến hành gọi refresh token
          //còn nếu api refresh token mà lỗi 401 thì không được gọi refresh token nữa
          if (isAxiosExpiredTokenError(error) && url !== URL_REFRESH_TOKEN) {
            //Việc này tránh call api refresh token 2 lần
            this.refreshTokenRequest = this.refreshTokenRequest
              ? this.refreshTokenRequest
              : this.handleRefreshToken().finally(() => {
                  // Sau khi thực hiện xong thì gán về null để lần sau có thể gọi tiếp
                  // Giữ refreshTokenRequest trong 10s cho những request tiếp theo nếu có 401 thì dùng
                  setTimeout(() => {
                    this.refreshTokenRequest = null
                  }, 10000)
                })
            return this.refreshTokenRequest.then((access_token) => {
              // Nghĩa là chúng ta tiếp tục gọi lại request cũ vừa bị lỗi
              // Nói cách khác là chúng ta set lại access_token mới lấy được vào trong header của config
              return this.instance({ ...config, headers: { ...config.headers, authorization: access_token } })
            })
          }

          // *Chỉ refresh token khi nào nó hết hạn và api call khác với api refresh token

          // Còn những trường hợp như token không đúng
          // không truyền token,
          // token hết hạn nhưng gọi refresh token bị fail(api call refresh access token bị lỗi)
          // thì tiến hành xóa local storage và toast message

          clearLS()
          this.accessToken = ''
          this.refreshToken = ''
          // *Chúng ta chỉ show những message của các lỗi 401 khác, còn nếu mà lỗi 401 do hết
          // hạn token thì không show vì nó đã được xử lí ở trên rồi
          toast.error(error.response?.data.data?.message || error.response?.data.message)
          // window.location.reload()
        }
        return Promise.reject(error)
      }
    )
  }
  // Tiến hành refreshToken, thì thì refreshToken sẽ gọi trọng axios luôn vì nó hỗ trợ gọi trong này luôn
  private handleRefreshToken() {
    // trong hàm này mình sẽ tiến hành gọi tới instance nghĩa là axios và tiến hành call api
    // khi mà gọi api thành công thì mình sẽ then để lấy access_token mới để khi hàm này chạy thì có được access_token mới luôn
    return this.instance
      .post<RefreshTokenResponse>(URL_REFRESH_TOKEN, {
        refresh_token: this.refreshToken
      })
      .then((res) => {
        // Lấy access_token mới
        const { access_token } = res.data.data
        // Cập nhật lại accessToken trong localStorage
        setAccessTokenToLS(access_token)
        // Set lại accessToken trong Http
        this.accessToken = access_token
        return access_token
      })
      .catch((error) => {
        // *Xảy ra lỗi khi refreshToken hết hạn và lúc này sẽ logout ra
        clearLS()
        this.accessToken = ''
        this.refreshToken = ''
        throw error
      })
  }
}

const http = new Http().instance

export default http
