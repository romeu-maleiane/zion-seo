
type ProductType = {
    productId: string;
    productImage: string | null;
    title: string;
}

interface handleFetchNextProductsForModalProps {  
    page?: number
    query?: string 
    shopId: string
}

export const handleFetchNextProductsForModal = async ({ page, query, shopId }: handleFetchNextProductsForModalProps) => {
    const storeId = shopId.replace('gid://shopify/Shop/', '');
    const result = await fetch(`/app/api/llm-dot-txt/getproducts/${storeId}/${page}?search=${query}`)

    const productData = await result.json()

    const products: ProductType[] =  productData.currentProducts
    const productsAsResouces = products.map((product: ProductType) => ({
        id: product.productId,
        image: product.productImage,
        title: product.title,
    }))
    const hasNextPage: boolean | undefined = productData.hasNextPage

    return { resources: productsAsResouces, hasNextPage }
}