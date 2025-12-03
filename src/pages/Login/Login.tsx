import { yupResolver } from '@hookform/resolvers/yup'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { Schema, schema } from '../../utils/rules'
import { useMutation } from '@tanstack/react-query'
import authApi from '../../apis/auth.api'
import { isAxiosUnprocessableEntity } from '../../utils/utils'
import { ErrorResponse } from '../../types/utils.type'
import Input from '../../components/Input'
import { useContext } from 'react'
import { AppContext } from '../../contexts/app.context'
import Button from '../../components/Button'
import { Helmet } from 'react-helmet'

// Mình sẽ lợi dụng Schema để định nghĩa thay cho type thuần luôn
type FormData = Pick<Schema, 'email' | 'password'>

// schema của login cũng khác nên cần độ chế lại miếng
const loginSchema = schema.pick(['email', 'password'])

function Login() {
  // Lấy setIsAuthenticated bằng useContext
  const { setIsAuthenticated, setProfile } = useContext(AppContext)
  // Giúp chuyển sang route productList '/'
  const navigate = useNavigate()
  //react-form
  const {
    register,
    setError,
    handleSubmit,
    formState: { errors }
  } = useForm<FormData>({
    resolver: yupResolver(loginSchema)
  })

  // loginMutation sử dụng react-query dùng để fetch api đăng ký tài khoảng
  const loginMutation = useMutation({
    mutationFn: (body: FormData) => authApi.login(body)
  })

  const onSubmit = handleSubmit((data) => {
    console.log('Payload gửi lên:', data)
    loginMutation.mutate(data, {
      // *Data trong onSuccess là data trả về từ server sau khi call api
      onSuccess: (data) => {
        console.log('Login thành công:', data)
        // Mục đích set luôn là để cho nó đồng bộ luôn chứ lúc đầu nó đâu có sẵn mà lấy từ LS
        //phải ctrl r mới có sẽ bị bất đồng bộ
        setIsAuthenticated(true)
        setProfile(data.data.data.user)
        navigate('/')
      },
      onError: (error) => {
        console.log(error)
        if (isAxiosUnprocessableEntity<ErrorResponse<FormData>>(error)) {
          const formError = error.response?.data.data
          if (formError) {
            Object.keys(formError).forEach((key) => {
              setError(key as keyof FormData, {
                message: formError[key as keyof FormData],
                type: 'Server'
              })
            })
          }
        }
      }
    })
  })

  return (
    <div className='bg-orange'>
      <Helmet>
        <title>Đăng nhập | Shopee Clone</title>
        <meta name='description' content='Đăng nhập vào dự án Shopee Clone' />
      </Helmet>
      <div className='container'>
        <div className='grid grid-cols-1 py-12 lg:grid-cols-5 lg:py-32 lg:pr-10'>
          {/* màn hình lớn thì chiếm 3 cột, bắt đầu từ cột thứ 1 */}
          {/* image */}
          <div className='ml-10 w-full bg-[url("D:\\PIEDTEAM_MERN\\F2\\Shopee\\Shopee-Clone\\src\\assets\\img-login.png")] bg-contain bg-center bg-no-repeat lg:col-span-3 lg:col-start-1'></div>
          {/* màn hình lớn thì chiếm 2 cột, bắt đầu từ cột thứ 4.*/}
          {/* form */}
          <div className='lg:col-span-2 lg:col-start-4'>
            <form className='rounded bg-white p-10 shadow-sm' onSubmit={onSubmit} noValidate>
              <div className='text-2xl'>Đăng nhập</div>
              <Input
                name='email' //
                register={register}
                type='email'
                placeholder='Email'
                className='mt-8'
                errrorMessage={errors.email?.message}
              />
              <Input
                name='password' //
                register={register}
                type='password'
                placeholder='Password'
                classNameEye='absolute right-[5px] h-5 w-5 cursor-pointer top-[12px]'
                className='mt-2'
                errrorMessage={errors.password?.message}
                autoComplete='on'
              />
              {/* button */}
              <div className='mt-3'>
                <Button
                  type='submit'
                  className='flex w-full items-center justify-center bg-red-500 px-2 py-4 text-sm uppercase text-white hover:bg-red-600'
                  isLoading={loginMutation.isPending}
                  disabled={loginMutation.isPending}
                >
                  Đăng Nhập
                </Button>
              </div>
              {/* forget and sms */}
              <div className='mt-2 flex justify-between'>
                <Link className='text-blue-900' to=''>
                  <span className='text-sm'>Quên mật khẩu</span>
                </Link>
                <Link className='text-blue-900' to=''>
                  <span className='text-sm'>Đăng nhập với SMS</span>
                </Link>
              </div>
              {/* --HOẶC-- */}
              <div className='mt-3 flex items-center'>
                <div className='flex-1 border-t border-gray-300'></div>
                <span className='px-3 text-sm uppercase text-gray-300'>hoặc</span>
                <div className='flex-1 border-t border-gray-300'></div>
              </div>
              {/* facebook and google */}
              <div className='mt-8 flex'>
                {/* facebook */}
                <div>
                  <button
                    type='button'
                    className='mb-2 me-2 inline-flex items-center rounded-lg bg-[#3b5998] px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-[#3b5998]/90 focus:outline-none focus:ring-4 focus:ring-[#3b5998]/50 dark:focus:ring-[#3b5998]/55'
                  >
                    <svg
                      className='me-2 h-4 w-4'
                      aria-hidden='true'
                      xmlns='http://www.w3.org/2000/svg'
                      fill='currentColor'
                      viewBox='0 0 8 19'
                    >
                      <path
                        fillRule='evenodd'
                        d='M6.135 3H8V0H6.135a4.147 4.147 0 0 0-4.142 4.142V6H0v3h2v9.938h3V9h2.021l.592-3H5V3.591A.6.6 0 0 1 5.592 3h.543Z'
                        clipRule='evenodd'
                      />
                    </svg>
                    Sign in with Facebook
                  </button>
                </div>
                {/* google */}
                <div>
                  <button
                    type='button'
                    className='mb-2 me-2 inline-flex items-center rounded-lg bg-[#4285F4] px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-[#4285F4]/90 focus:outline-none focus:ring-4 focus:ring-[#4285F4]/50 dark:focus:ring-[#4285F4]/55'
                  >
                    <svg
                      className='me-2 h-4 w-4'
                      aria-hidden='true'
                      xmlns='http://www.w3.org/2000/svg'
                      fill='currentColor'
                      viewBox='0 0 18 19'
                    >
                      <path
                        fillRule='evenodd'
                        d='M8.842 18.083a8.8 8.8 0 0 1-8.65-8.948 8.841 8.841 0 0 1 8.8-8.652h.153a8.464 8.464 0 0 1 5.7 2.257l-2.193 2.038A5.27 5.27 0 0 0 9.09 3.4a5.882 5.882 0 0 0-.2 11.76h.124a5.091 5.091 0 0 0 5.248-4.057L14.3 11H9V8h8.34c.066.543.095 1.09.088 1.636-.086 5.053-3.463 8.449-8.4 8.449l-.186-.002Z'
                        clipRule='evenodd'
                      />
                    </svg>
                    Sign in with Google
                  </button>
                </div>
              </div>
              {/* translate */}
              <div className='mt-8 flex justify-center'>
                <span className='text-gray-400'>Bạn mới biết đến Shopee?</span>
                <Link className='ml-2 text-red-400 hover:text-red-600' to='/register'>
                  Đăng ký
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login

/**
 * Mặc dù setProfileToLS thì sẽ lưu cứng rồi. Tuy nhiên nếu không setstate setProfile thì nó sẽ bị
 * một vấn đề là tên khi lấy ra để hiển thị sẽ không có liền vì lúc đầu chưa setProfile thì profile đâu có giá trị
 * để lấy ra hiển thị. Gía trị nó chỉ có khi chúng ta ctrl-R lúc đó ở lần thứ 2 nó sẽ lấy giá trị bằng getProFileToLS
 * lúc đó sẽ có sẵn giá trị.
 * ==> chính vì vậy ta nên setState luôn để dữ liệu có sẵn mà lấy ra liền
 * Tóm lại: mục đích setProfile để dữ liệu có liền
 *          mục đích setProfileToLS là để ctrl R dữ liệu k mất
 */
