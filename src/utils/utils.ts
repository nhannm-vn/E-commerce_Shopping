import axios, { AxiosError } from 'axios'
import HttpStatusCode from '../constants/httpStatusCode.enum'
import userImage from '../assets/images/user.svg'
import { ErrorResponse } from '../types/utils.type'
// Type Predicate
// utils này sẽ giúp check xem có phải lỗi của axios hay không
// mình còn muốn sau khi chạy func này thì error của mình nó sẽ chuyển thành type nhất định
// nghĩa là khi chạy func thì error unknown thành kiểu nhất định luôn
export function isAxiosError<T>(error: unknown): error is AxiosError<T> {
  return axios.isAxiosError(error)
}

// còn function này sẽ check xem có phải là lỗi 422 không
// EntityError phải thỏa là AxiosError và có status là 422

export function isAxiosUnprocessableEntity<FormError>(error: unknown): error is AxiosError<FormError> {
  return isAxiosError(error) && error.response?.status == HttpStatusCode.UnprocessableEntity
}

// check lỗi 401
export function isAxiosUnauthorizedError<UnauthorizedError>(error: unknown): error is AxiosError<UnauthorizedError> {
  return isAxiosError(error) && error.response?.status == HttpStatusCode.Unauthorized
}
// check lỗi trong trường hợp token hết hạn
// thì đầu tiên lỗi này phải là lỗi 401 đã
export function isAxiosExpiredTokenError<UnauthorizedError>(error: unknown): error is AxiosError<UnauthorizedError> {
  return (
    // Đầu tiên nó phải là lỗi 401
    isAxiosUnauthorizedError<ErrorResponse<{ name: string; message: string }>>(error) &&
    // trong response name có thêm thuộc tính name EXPIRED_TOKEN
    error.response?.data?.data?.name === 'EXPIRED_TOKEN'
  )
}

// Khi bạn viết AxiosError<FormError>, thì FormError chính là generic
// type dùng để định nghĩa kiểu dữ liệu của error.response.data trong lỗi mà Axios trả về.

// **** Func giúp chuyển đổi các con số về đúng dạng theo UI
export function formatCurrency(currency: number) {
  return new Intl.NumberFormat('de-DE').format(currency)
}

export function formatNumberToSocialStyle(value: number) {
  return new Intl.NumberFormat('en', {
    notation: 'compact',
    maximumFractionDigits: 1
  })
    .format(value)
    .replace('.', ',')
    .toLocaleLowerCase()
}

// Func tính % giảm giá
export const rateSale = (original: number, sale: number) => Math.round(((original - sale) / original) * 100) + '%'

// Func xoá các ký tự đặc biệt
const removeSpecialCharacter = (str: string) =>
  // eslint-disable-next-line no-useless-escape
  str.replace(/!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g, '')

// Func này giúp cho việc biến đường dẫn URL thân thiện SEO hơn bằng cách thêm tên sản phẩm kèm theo Id
//chứ không phải cái tên sp muốn đem lên URL là đem lỡ có kí tự đặc biệt là bú
export const generateNameId = ({ name, id }: { name: string; id: string }) => {
  // Đầu tiên là xóa các ký tự đặc biệt có trong name. Sau đó là thay thế toàn bộ các dấu space bằng dấu '-'
  // tiếp theo sẽ nối id vào nhưng ở giữa phải có '-i.' để một hồi cắt ra bỏ vào queryFunc lấy ra sản phẩm render ra
  return removeSpecialCharacter(name).replace(/\s/g, '-') + `-i-${id}`
}

// Func lấy ra id từ URL được biến đổi theo cách ở trên
export const getIdFromNameId = (nameId: string) => {
  const arr = nameId.split('-i-')
  // Trả ra phần tử cuối cùng của mảng
  return arr[arr.length - 1]
}

// Lúc backend chưa fix thì tên tấm ảnh cần cộng thêm thành phần này ở đằng trước
//nếu có thì đưa cho avatar nếu không có thì đưa cái icon
// Vì có thể có avatar để truyền vào cũng có thể api trả về chưa có nên cần thêm ?
export const getAvatarUrl = (avatarName?: string) => (avatarName ? avatarName : userImage)
