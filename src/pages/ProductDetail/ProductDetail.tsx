import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import productApi from '../../apis/product.api'
import ProductRating from '../../components/ProductRating'
import { formatCurrency, formatNumberToSocialStyle, getIdFromNameId, rateSale } from '../../utils/utils'
import DOMPurify from 'dompurify'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Product as ProductType, ProductListConfig } from '../../types/product.type'
import Product from '../ProductList/components/Product'
import QuantityController from '../../components/QuantityController'
import purchaseApi from '../../apis/purchase.api'
import { purchasesStatus } from '../../constants/purchase'
import { toast } from 'react-toastify'
import path from '../../constants/path'
import { useTranslation } from 'react-i18next'
import { Helmet } from 'react-helmet'
import { convert } from 'html-to-text'

function ProductDetail() {
  //i18n
  const { t } = useTranslation('product')

  // Tạo cái hook navigate
  const navigate = useNavigate()

  // Biến tên nameId vì mình quy định dynamic router trong path.ts như vậy
  const { nameId } = useParams()

  // Lấy ra id từ nameId rồi mới fetch được dữ liệu
  const id = getIdFromNameId(nameId as string)
  const { data: productDetailData } = useQuery({
    // Điền cái id để khi id thay đổi thì dữ liệu sẽ fetch lại
    queryKey: ['product', id],
    // Phải as string vì mình biết id lúc nào cũng có
    queryFn: () => productApi.getProductDetail(id as string)
  })
  // Lấy dữ liệu ra
  const product = productDetailData?.data.data
  console.log(product)

  // Tạo ra cái state để lưu index image hiện tại
  //khi bấm next hoặc prev thì sẽ thay đổi cái state
  // **Lưu ý mình sẽ cho từ 0 - 5 vì slice sẽ lấy index cuối - 1
  const [currentIndexImages, setCurrentIndexImages] = useState([0, 5])

  // Thằng này dùng để lưu trạng thái active của bức ảnh
  const [activeImage, setActiveImage] = useState('')

  // Thằng này dùng để lưu value của button
  const [buyCount, setBuyCount] = useState(1)

  const handleBuyCount = (value: number) => {
    setBuyCount(value)
  }

  const queryClient = useQueryClient()

  // Dùng để DOM tới image
  //nghĩa là điều khiển bằng cách DOM tới như js truyền thống
  const imageRef = useRef<HTMLImageElement>(null)

  // Thằng này dựa vào state để lấy ra mảng các bức ảnh
  // Mỗi lần component re-render thì sẽ tính toán lại. Mình sẽ hạn chế nó bằng useMemo
  //currentImages sẽ là cái mảng lưu 5 cái ảnh lấy ra được hiện tại
  const currentImages = useMemo(
    () => (product ? product.images.slice(...currentIndexImages) : []),
    [product, currentIndexImages]
  )

  // Lấy dữ liệu ra để hiển thị các sản phẩm cùng category dựa vào categoryId của productDetail
  const queryConfig: ProductListConfig = { limit: '20', page: '1', category: product?.category._id }
  const { data: productsData } = useQuery({
    queryKey: ['products', queryConfig],
    queryFn: () => {
      return productApi.getProducts(queryConfig)
    },
    // Chỉ fetch khi có product rồi, để không fetch lần đầu ra toàn bộ sản phẩm
    enabled: Boolean(product),
    // Giúp khi đã có sản phẩm lọc theo category bên ProductList rồi khì không fetch lại nữa
    staleTime: 3 * 60 * 1000
  })
  console.log(productsData)

  //addToCart
  const addToCartMutation = useMutation({
    mutationFn: (body: { product_id: string; buy_count: number }) => purchaseApi.addToCart(body)
  })

  // Lúc đầu vào chưa có ảnh. Sau khi có data rồi thì sẽ luôn là bức ảnh đầu tiên
  // chứ không lẽ để defaultValue là nguyên cái chuỗi ảnh luôn thì xấu
  useEffect(() => {
    if (product && product.images.length > 0) {
      setActiveImage(product.images[0])
    }
  }, [product])

  // Func next image
  const next = () => {
    // Nghĩa là nếu nó chưa tới giới hạn thì cho nó next tiếp
    if (currentIndexImages[1] < (product as ProductType).images.length) {
      setCurrentIndexImages((prev) => [prev[0] + 1, prev[1] + 1])
    }
  }

  const prev = () => {
    // Nghĩa là nó > 0 thì mới cho nó lùi
    if (currentIndexImages[0] > 0) {
      setCurrentIndexImages((prev) => [prev[0] - 1, prev[1] - 1])
    }
  }

  // Func active
  const chooseActive = (img: string) => {
    setActiveImage(img)
  }

  // Func zoom in image
  const handleZoom = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    // Lấy ra object chứa các thông số về h,w của div dính event
    const rect = event.currentTarget.getBoundingClientRect()
    // lấy cái ref dom ở trên ra sử dụng
    const image = imageRef.current as HTMLImageElement
    // Lấy ra naturalHeight và naturalWidth để khi zoom ảnh thì nó sẽ thay đổi
    const { naturalHeight, naturalWidth } = image

    // C1: Lấy offsetX, offsetY đơn giản khi chúng ta đã xử lí được bubble event
    const { offsetX, offsetY } = event.nativeEvent
    // Công thức tính top và left khi move chuột
    const top = offsetY * (1 - naturalHeight / rect.height)
    const left = offsetX * (1 - naturalWidth / rect.width)
    // Cho cái hình về chiều cao và dài nguyên bản của nó
    image.style.width = naturalWidth + 'px'
    image.style.height = naturalHeight + 'px'
    image.style.maxWidth = 'unset'
    // Ap dung
    image.style.top = top + 'px'
    image.style.left = left + 'px'
    // Event Bubble: nghĩa là chồng nhiều sự kiện không biết lúc nào cha, lúc nào con
    // Để fix được thì ta cần thêm thuộc tính pointer-events-none: nghĩa là không bị ảnh hưởng bởi sự kiện chuột cho thẻ img
  }

  // Func handle remove zoom
  const handleRemoveZoom = () => {
    imageRef.current?.removeAttribute('style')
  }

  const addToCart = () => {
    addToCartMutation.mutate(
      { buy_count: buyCount, product_id: product?._id as string },
      {
        // Thằng này giúp cho khi chúng ta addToCart thành công thì nó sẽ fetch lại api
        // giúp cho sản phẩm có liền trong cart
        onSuccess: (data) => {
          // Xaì toastify để thông báo thêm sản phẩm vào giỏ hàng thành công
          toast.success(data.data.message, {
            autoClose: 3000
          })
          queryClient.invalidateQueries({ queryKey: ['purchases', { status: purchasesStatus.inCart }] })
        }
      }
    )
  }

  // Mua hang nhanh
  const buyNow = async () => {
    // Đầu tiên là thêm vào cart trước bằng api
    const res = await addToCartMutation.mutateAsync({
      buy_count: buyCount, //
      product_id: product?._id as string
    })
    // Lấy ra purchase
    const purchase = res.data.data
    // Sau khi bấm nút thì chuyển sang trang cart
    //Lúc chuyển thì có thêm id nữa
    navigate(path.cart, {
      state: {
        purchaseId: purchase._id
      }
    })
  }

  // Giúp tránh dấu ? làm không đẹp do dữ liệu có thể underfined
  if (!product) return null

  return (
    <div className='bg-gray-200 py-6'>
      <Helmet>
        <title>{product.name} | Shopee Clone</title>
        <meta
          name='description'
          content={convert(product.description, {
            limits: { ellipsis: '...', maxInputLength: 150 }
          })}
        />
      </Helmet>
      <div className='container'>
        <div className='bg-white p-4 shadow'>
          {/* Vì có thể data là undefind nên cần phải check */}
          {product && (
            <div className='grid grid-cols-12 gap-9'>
              {/* Left */}
              <div className='border-purple-600-500 col-span-5 border-[1px] shadow-sm'>
                {/* Kỹ thuật để cho hình có chiều cao bằng chiều rộng */}
                <div
                  className='relative w-full cursor-zoom-in overflow-hidden pt-[100%] shadow'
                  onMouseMove={handleZoom}
                  onMouseLeave={handleRemoveZoom}
                >
                  <img
                    className='pointer-events-none absolute left-0 top-0 h-full w-full bg-white object-cover' //
                    src={activeImage || product.images[0]}
                    alt={product.name}
                    ref={imageRef}
                  />
                </div>
                <div className='relative mt-4 grid grid-cols-5 gap-1'>
                  <button
                    className='absolute left-0 top-1/2 z-10 h-9 w-5 -translate-y-1/2 bg-black/20 text-white'
                    onClick={prev}
                  >
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      fill='none'
                      viewBox='0 0 24 24'
                      strokeWidth={1.5}
                      stroke='currentColor'
                      className='size-6'
                    >
                      <path strokeLinecap='round' strokeLinejoin='round' d='M15.75 19.5 8.25 12l7.5-7.5' />
                    </svg>
                  </button>
                  {/* render ra các bức ảnh */}
                  {currentImages.map((img) => {
                    const isActive = img === activeImage
                    return (
                      <div
                        className='relative w-full pt-[100%] shadow'
                        key={img}
                        onMouseEnter={() => chooseActive(img)}
                      >
                        <img
                          className='absolute left-0 top-0 h-full w-full cursor-pointer bg-white object-cover' //
                          src={img}
                          alt={product.name}
                        />
                        {/* Việc này giúp có border bao quanh khi active nhưng không làm thay đổi kích thước của ảnh
                          inset-0 giúp ôm sát tất cả các cạnh
                        */}
                        {isActive && <div className='absolute inset-0 border-2 border-orange'></div>}
                      </div>
                    )
                  })}
                  <button
                    className='absolute right-0 top-1/2 z-10 h-9 w-5 -translate-y-1/2 bg-black/20 text-white'
                    onClick={next}
                  >
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      fill='none'
                      viewBox='0 0 24 24'
                      strokeWidth={1.5}
                      stroke='currentColor'
                      className='size-6'
                    >
                      <path strokeLinecap='round' strokeLinejoin='round' d='m8.25 4.5 7.5 7.5-7.5 7.5' />
                    </svg>
                  </button>
                </div>
              </div>
              {/* Right */}
              <div className='border-black-500 col-span-7 border-[1px] p-4 shadow-sm'>
                {/* Name Sp */}
                <h1 className='text-xl font-medium capitalize'>{product.name}</h1>
                {/*  */}
                {/* Information */}
                <div className='mt-8 flex items-center'>
                  {/* Rating */}
                  <div className='flex items-center'>
                    <span className='mr-1 border border-b border-b-orange border-l-transparent border-r-transparent border-t-transparent text-orange'>
                      {product.rating}
                    </span>
                    <ProductRating
                      rating={product.rating}
                      activeClassname='fill-orange text-orange h-4 w-4' //
                      nonActiveClassname='fill-gray-300 text-gray-300 h-4 w-4'
                    />
                  </div>
                  <div className='mx-4 h-4 w-[1px] bg-gray-300'></div>
                  {/* View */}
                  <div>
                    <span className='mr-1 border border-b border-b-black border-l-transparent border-r-transparent border-t-transparent text-black'>
                      {formatNumberToSocialStyle(product.view)}
                    </span>
                    <span className='ml-1 text-gray-500'>Đã xem</span>
                  </div>
                  <div className='mx-4 h-4 w-[1px] bg-gray-300'></div>
                  {/* Sold */}
                  <div>
                    <span className='mr-1 border border-b border-b-black border-l-transparent border-r-transparent border-t-transparent text-black'>
                      {formatNumberToSocialStyle(product.sold)}
                    </span>
                    <span className='ml-1 text-gray-500'>Đã bán</span>
                  </div>
                  <div className='mx-4 h-4 w-[1px] bg-gray-300'></div>
                  {/* Quantity */}
                  <div>
                    <span className='mr-1 border border-b border-b-black border-l-transparent border-r-transparent border-t-transparent text-black'>
                      {formatNumberToSocialStyle(product.quantity)}
                    </span>
                    <span className='ml-1 text-gray-500'>Số lượng</span>
                  </div>
                </div>
                {/* Khoang gia */}
                <div className='mt-8 flex items-center bg-gray-100 px-5 py-4'>
                  <div className='text-gray-500 line-through'>₫{formatCurrency(product.price_before_discount)}</div>
                  <div className='ml-5 text-3xl font-medium text-orange'>{formatCurrency(product.price)}</div>
                  <div className='ml-5 rounded-sm bg-orange px-1 py-[2px] text-xs font-semibold uppercase text-white'>
                    {rateSale(product.price_before_discount, product.price)} Giảm
                  </div>
                </div>
                {/* So Luong */}
                <div className='mt-8 flex items-center'>
                  <div className='capitalize text-gray-500'>Số lượng</div>
                  {/* Input so luong hang */}
                  <QuantityController
                    onDecrease={handleBuyCount}
                    onIncrease={handleBuyCount}
                    onType={handleBuyCount}
                    value={buyCount}
                    max={product.quantity}
                  />
                  {/* So luong sp co san */}
                  <div className='ml-6 text-sm text-gray-500'>
                    {product.quantity} {t('available')}
                  </div>
                </div>
                {/* Button dat hang */}
                <div className='mt-8 flex items-center'>
                  <button
                    onClick={addToCart}
                    className='justify-content-center flex h-12 items-center rounded-sm border border-orange bg-orange/10 px-5 capitalize text-orange shadow-sm hover:bg-orange/5'
                  >
                    <svg
                      enableBackground='new 0 0 15 15'
                      viewBox='0 0 15 15'
                      x={0}
                      y={0}
                      className='mr-[10px] h-5 w-5 fill-current stroke-orange text-orange'
                    >
                      <g>
                        <g>
                          <polyline
                            fill='none'
                            points='.5 .5 2.7 .5 5.2 11 12.4 11 14.5 3.5 3.7 3.5'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeMiterlimit={10}
                          />
                          <circle cx={6} cy='13.5' r={1} stroke='none' />
                          <circle cx='11.5' cy='13.5' r={1} stroke='none' />
                        </g>
                        <line
                          fill='none'
                          strokeLinecap='round'
                          strokeMiterlimit={10}
                          x1='7.5'
                          x2='10.5'
                          y1={7}
                          y2={7}
                        />
                        <line fill='none' strokeLinecap='round' strokeMiterlimit={10} x1={9} x2={9} y1='8.5' y2='5.5' />
                      </g>
                    </svg>
                    Thêm vào giỏ hàng
                  </button>
                  <button
                    onClick={buyNow}
                    className='ml-4 flex h-12 min-w-[5rem] items-center justify-center rounded-sm bg-orange px-5 capitalize text-white shadow-sm outline-none hover:bg-orange/90'
                  >
                    Mua ngay
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Chi tiet sp */}
      <div className='mt-8'>
        <div className='container'>
          <div className='mt-8 bg-white p-4 shadow'>
            <div className='rounded bg-gray-100 p-4 text-lg capitalize text-slate-700'>Mô tả sản phẩm</div>
            <div className='mx-4 mb-4 mt-12 text-sm leading-loose'>
              {/* Chống tấn công xxs */}
              <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.description) }} />
            </div>
          </div>
        </div>
      </div>
      <div className='mt-8'>
        <div className='container'>
          <div className='uppercase text-gray-400'>Có thể bạn cũng thích</div>
          {productsData && (
            <div className='mt-6 grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'>
              {productsData.data.data.products.map((product) => (
                <div className='col-span-1' key={product._id}>
                  <Product product={product} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductDetail

// Bình thường sẽ không render ra được html. Vì đó là cách mà jsx giúp chống tấn công xss
// dangerouslySetInnerHTML nghĩa là những thằng trong này rất nguy hiểm dễ bị tấn công
// ** Để khắc chế người ta chén thẻ script thì xài thư viện dompurify, nó sẽ loại bỏ js trong câu code
//`<div onclick={alert('ok')}>hehe</div>`
