import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { schema, Schema } from '../../utils/rules'
import Input from '../../components/Input'
import { yupResolver } from '@hookform/resolvers/yup'
import { useMutation } from '@tanstack/react-query'
import authApi from '../../apis/auth.api'
import { omit } from 'lodash'
import { isAxiosUnprocessableEntity } from '../../utils/utils'
import { ErrorResponse } from '../../types/utils.type'
import { AppContext } from '../../contexts/app.context'
import { useContext } from 'react'
import Button from '../../components/Button'
import { Helmet } from 'react-helmet'

//interface này giúp cho nó hiểu
//Form có gì và khi có lỗi thì sẽ dạng lỗi gì

type FormData = Pick<Schema, 'email' | 'password' | 'confirm_password'>

const registerSchema = schema.pick(['email', 'password', 'confirm_password'])

function Register() {
  // Lấy setIsAuthenticated bằng useContext
  const { setIsAuthenticated, setProfile } = useContext(AppContext)
  // Giúp chuyển sang route productList '/'
  const navigate = useNavigate()
  const {
    // hỗ trợ lấy giá trị và validate cho các ô input
    register,
    // thằng này hỗ trợ việc submit thay vì phải viết hàm và tạo state
    handleSubmit,
    // error này sẽ có khi form có lỗi
    formState: { errors },
    setError
    // setError từ react-hook-form khi chúng ta có được cái lỗi chúng ta sẽ set error vào react-hook-form
    // và react-hook-form sẽ show lên cho chúng ta
    // Lưu ý lỗi 422 thì hiển thị lên form còn lỗi khác thì sẽ toach lên
  } = useForm<FormData>({
    resolver: yupResolver(registerSchema)
  })

  // registerAccountMutation sử dụng react-query dùng để fetch api đăng ký tài khoảng
  const registerAccountMutation = useMutation({
    mutationFn: (body: Omit<FormData, 'confirm_password'>) => authApi.registerAccount(body)
  })

  const onSubmit = handleSubmit((data) => {
    // handleSubmit của react-hook-form sẽ lấy tất cả những gì có trong form
    // tuy nhiên mình sẽ gởi đúng thôi chứ không gửi dư làm gì
    const body = omit(data, ['confirm_password'])
    console.log('Payload gửi lên:', body)
    registerAccountMutation.mutate(body, {
      onSuccess: (data) => {
        console.log('Register thành công:', data)
        setProfile(data.data.data.user)
        setIsAuthenticated(true)
        navigate('/')
      },
      onError: (error) => {
        console.log(error)
        if (isAxiosUnprocessableEntity<ErrorResponse<Omit<FormData, 'confirm_password'>>>(error)) {
          const formError = error.response?.data.data
          if (formError) {
            Object.keys(formError).forEach((key) => {
              setError(key as keyof Omit<FormData, 'confirm_password'>, {
                message: formError[key as keyof Omit<FormData, 'confirm_password'>],
                type: 'Server'
              })
            })
          }
          // if (formError?.email) {
          //   setError('email', {
          //     message: formError.email,
          //     type: 'Server'
          //   })
          // }
          // if (formError?.password) {
          //   setError('password', {
          //     message: formError.password,
          //     type: 'Server'
          //   })
          // }
        }
      }
    })
  })

  return (
    <div className='bg-orange'>
      <Helmet>
        <title>Đăng ký | Shopee Clone</title>
        <meta name='description' content='Đăng ký tài khoảng vào dự án Shopee Clone' />
      </Helmet>
      <div className='container'>
        <div className='grid grid-cols-1 py-12 lg:grid-cols-5 lg:py-32 lg:pr-10'>
          {/* màn hình lớn thì chiếm 2 cột, bắt đầu từ cột thứ 4.*/}
          {/* image */}
          <div className='ml-10 w-full bg-[url("D:\\PIEDTEAM_MERN\\F2\\Shopee\\Shopee-Clone\\src\\assets\\img-register.png")] bg-contain bg-center bg-no-repeat lg:col-span-3 lg:col-start-1'></div>
          {/* form */}
          <div className='lg:col-span-2 lg:col-start-4'>
            <form className='rounded bg-white p-10 shadow-sm' onSubmit={onSubmit} noValidate>
              <div className='text-2xl'>Đăng Ký</div>
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
                className='mt-2'
                errrorMessage={errors.password?.message}
                autoComplete='on'
              />
              <Input
                name='confirm_password' //
                register={register}
                type='password'
                placeholder='Confirm Password'
                className='mt-2'
                errrorMessage={errors.confirm_password?.message}
                autoComplete='on'
              />

              {/* button */}
              <div className='mt-2'>
                <Button
                  type='submit'
                  className='flex w-full items-center justify-center bg-red-500 px-2 py-4 text-sm uppercase text-white hover:bg-red-600'
                  isLoading={registerAccountMutation.isPending}
                  disabled={registerAccountMutation.isPending}
                >
                  Đăng ký
                </Button>
              </div>
              {/* Thêm các chính sách */}
              <div className='m-8'>
                <p className='text-center text-sm'>Bằng việc đăng kí, bạn đã đồng ý với Shopee về</p>
                <div className='flex justify-center'>
                  <Link className='mr-2 text-red-500' to=''>
                    <span className='text-sm'>Điều khoản dịch vụ</span>
                  </Link>
                  <span>&</span>
                  <Link className='ml-2 text-red-500' to=''>
                    <span className='text-sm'>Chính sách bảo mật</span>
                  </Link>
                </div>
              </div>
              {/*  */}
              <div className='mt-8 flex justify-center'>
                <span className='text-gray-400'>Bạn đã có tài khoản?</span>
                <Link className='ml-2 text-red-400 hover:text-red-600' to='/login'>
                  Đăng nhập
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
