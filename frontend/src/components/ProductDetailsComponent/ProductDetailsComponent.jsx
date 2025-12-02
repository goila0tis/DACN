import { Col, Row, Image, InputNumber, Rate } from 'antd'
import imageProductSmall from '../../assets/images/imagesmall.webp'
import { WrapperStyleColImage, WrapperStyleImageSmall, WrapperStyleNameProduct, WrapperStyleTextSell, WrapperPriceProduct, WrapperPriceTextProduct, WrapperAddressProduct, WrapperQualitytProduct, WrapperInputNumber, onChange } from './style'
import { PlusOutlined, StarFilled, MinusOutlined } from '@ant-design/icons'
import ButtonComponent from '../ButtonComponent/ButtonComponent'
import * as ProductService from '../../services/ProductService'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { addOrderProduct } from '../../redux/slides/orderSlide'
import { convertPrice } from '../../utils'

const ProductDetailsComponent = ({idProduct}) => {
    const[numProduct, setNumProduct] = useState(1)
    const user = useSelector ((state) => state.user)
    const navigate = useNavigate()
    const location = useLocation()
    const dispatch = useDispatch()

    const onChange = (value) => { 
        setNumProduct(Number(value))
    }

    const fetchGetDetailsProduct = async (context) => {
      const id = context?.queryKey && context?.queryKey[1]
            if (id){
                const res = await ProductService.getDetailsProduct(id)
                return res.data
            }
   
         }
    const handleChangeCount = (type) => {
        if (type === 'increase') {
            setNumProduct(numProduct + 1 )
        } else {
            setNumProduct(numProduct - 1)
        }
    }

    const handleAddOrderProduct = () => {
        if(!user?.id){
            navigate('/sign-in', {state: location?.pathname})
        }else{
            dispatch(addOrderProduct({
                orderItem:{
                    name: productDetails?.name,
                    amount: numProduct,
                    image: productDetails?.image,
                    price: productDetails?.price,
                    product: productDetails?._id
                }
            }))
        }
    }

    const { isLoading, data: productDetails } = useQuery({
    queryKey: ['product-details', idProduct],
    queryFn: fetchGetDetailsProduct,
    enabled: !!idProduct
    })
    console.log('productDetails', productDetails)

    return (
        <>
        <Row style={{ padding:'16px', background: '#fff', borderRadius: '4px' }}>
            <Col span={10} style={{ borderRight: '1px solid #e5e5e5', paddingRight: '8px' }}>
                <Image src={productDetails?.image} alt="image product" preview={false}/>
            </Col>
            <Col span={14} style={{ paddingLeft: '10px' }}>
            <WrapperStyleNameProduct>{productDetails?.name}</WrapperStyleNameProduct>
                <div>
                    <Rate allowHalf defaultValue={productDetails?.rating} value={productDetails?.rating} />
                    <WrapperStyleTextSell> | Đã bán {productDetails?.selled || 0}</WrapperStyleTextSell>
                </div>

                <WrapperPriceProduct>
                    <WrapperPriceTextProduct>
                        {productDetails?.discount
                            ? convertPrice(productDetails.price - productDetails.price * (productDetails.discount / 100))
                            : convertPrice(productDetails?.price)}
                    </WrapperPriceTextProduct>
                </WrapperPriceProduct>

                <div style={{ margin: '10px 0', padding: '10px 0', borderTop: '1px solid #e5e5e5', borderBottom: '1px solid #e5e5e5' }}>
                    <div>Loại sản phẩm: {productDetails?.type}</div>
                    <div>Tồn kho: {productDetails?.countInStock}</div>
                    {productDetails?.description && <div>Mô tả: {productDetails.description}</div>}
                    {productDetails?.discount && <div>Giảm giá: {productDetails.discount}%</div>}
                </div>

                <div style={{ margin: '10px 0 20px', padding: '10px 0', borderTop: '1px solid #e5e5e5', borderBottom: '1px solid #e5e5e5' }}>
                    <div style={{ marginBottom: '10px' }}>Số lượng</div>
                    <WrapperQualitytProduct>
                        <button style={{ border: 'none', background: 'transparent', cursor: 'pointer' }} onClick={() => handleChangeCount('decrease')}>
                            <MinusOutlined style={{ color: '#000', fontSize: '20px' }} />
                        </button>
                        <WrapperInputNumber defaultValue={1} onChange={onChange} value={numProduct} size="small" />
                        <button style={{ border: 'none', background: 'transparent', cursor: 'pointer' }} onClick={() => handleChangeCount('increase')}>
                            <PlusOutlined style={{ color: '#000', fontSize: '20px' }} />
                        </button>
                    </WrapperQualitytProduct>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <ButtonComponent
                        size={40}
                        styleButton={{
                            background: 'rgb(255, 57, 69)',
                            height: '48px',
                            width: '220px',
                            bordered: 'none',
                            borderedRadius: '4px'
                        }}
                        onClick={handleAddOrderProduct}
                        textButton={'Chọn mua'}
                        styleTextButton={{ color: '#fff', fontSize: '15px', fontWeight: '700' }}
                    />
                    <ButtonComponent
                        size={40}
                        styleButton={{
                            background: '#fff',
                            height: '48px',
                            width: '220px',
                            bordered: '1px solid rgb(13, 92, 182)',
                            borderedRadius: '4px'
                        }}
                        textButton={'Mua trả sau'}
                        styleTextButton={{ color: 'rgb(13, 92, 182)', fontSize: '15px' }}
                    />
                </div>
            </Col>
        </Row>

        </>
    )
}

export default ProductDetailsComponent
