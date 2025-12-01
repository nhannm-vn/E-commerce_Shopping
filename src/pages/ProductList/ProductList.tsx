import { keepPreviousData, useQuery } from '@tanstack/react-query'
import AsideFilter from './components/AsideFilter'
import productApi from '../../apis/product.api'
import Pagination from '../../components/Pagination'
import { ProductListConfig } from '../../types/product.type'
import categoryApi from '../../apis/category.api'
import Product from './components/Product'
import SortProductList from './components/SortProductList'
import useQueryConfig from '../../hooks/useQueryConfig'
import { Helmet } from 'react-helmet'

function ProductList() {
  // Sử dụng custom hook
  const queryConfig = useQueryConfig()

  // Lấy dữ liệu ra
  const { data: productsData } = useQuery({
    // Vì chúng ta có ProductConfig nữa nên cần truyền thêm queryParams nữa
    // khi các key thay đổi thì nó sẽ chạy lại một lần nữa để cho chúng ta có cái data mới
    // **Nếu mà mình không gửi param nào thì nó sẽ mặc định trả về 1 và 30
    queryKey: ['products', queryConfig],
    queryFn: () => {
      return productApi.getProducts(queryConfig as ProductListConfig)
    },
    // Giữ lại dữ liệu cũ đợi tới có dữ liệu mới thì thay đổi tránh bị giật
    placeholderData: keepPreviousData,
    staleTime: 3 * 60 * 1000
  })

  // Lấy dữ liệu từ call api của category
  const { data: categoriesData } = useQuery({
    // Ở đây chỉ có lấy ra 1 lần show trên menu thôi nên không cần key gì thêm
    queryKey: ['categories'],
    queryFn: () => {
      return categoryApi.getCategories()
    }
  })
  return (
    <div className='bg-gray-200 py-6'>
      <Helmet>
        <title>Trang chủ | Shopee Clone</title>
        <meta name='description' content='Trang chủ dự án Shopee Clone' />
      </Helmet>
      <div className='container'>
        {/* Vì có thể data là undefind nên cần phải check */}
        {productsData && (
          <div className='grid grid-cols-12 gap-6'>
            <div className='col-span-3'>
              {/* Lưu ý trường hợp undefined thì phải có [] hoặc && */}
              <AsideFilter categories={categoriesData?.data.data || []} queryConfig={queryConfig} />
            </div>
            <div className='col-span-9'>
              <SortProductList queryConfig={queryConfig} pageSize={productsData.data.data.pagination.page_size} />
              {/* chia theo break-point */}
              <div className='mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'>
                {productsData.data.data.products.map((product) => (
                  <div className='col-span-1' key={product._id}>
                    <Product product={product} />
                  </div>
                ))}
              </div>
              {/* Pagination */}
              <Pagination queryConfig={queryConfig} pageSize={productsData.data.data.pagination.page_size} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductList
