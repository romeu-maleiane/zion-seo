import  prisma  from '../db.server'

interface CreateOrUpdateProductsType {
    node: {
        id: string
        title: string
        description: string
        createdAt: string
        seo: {
            title: string
            description: string
        }
        featuredMedia: {
            image: {
                url: string
            }
        }
    }
}

export const createOrUpdateProducts = async (productsData: Array<CreateOrUpdateProductsType>, shopId: string) => {

    try {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const createdsProductsOrUpdateds = productsData.map(async (product) => {

            const productImage = product?.node?.featuredMedia?.image?.url
                ? product.node.featuredMedia.image.url
                : 'https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-image_large.png';

            const metaTitle = product.node?.seo?.title 
                ? product.node.seo.title : '';
            const metaDescription = product.node?.seo?.description 
                ? product.node.seo.description : '';

            const ProductCreatedOrUpdated = await prisma.product.upsert({
                where: {
                    productId: product.node.id,
                },
                update: {
                    productImage: productImage,
                    storeId: shopId,
                    title: product.node.title,
                    currentDescription: product.node.description,
                    currentMetaTitle: metaTitle,
                    currentMetaDescription: metaDescription,
                    createdAt: product.node.createdAt
                },
                create: {
                    productId: product.node.id,
                    productImage: productImage,
                    title: product.node.title,
                    currentDescription: product.node.description,
                    currentMetaTitle: metaTitle,
                    currentMetaDescription: metaDescription,
                    store: {
                        connect: { storeId: shopId }
                    },
                    createdAt: product.node.createdAt
                },
            })

            return ProductCreatedOrUpdated
        })

        return Response.json({ message: 'success' }, { status: 200 })

    } catch (error) {
        console.error('CreateOrUpdateProducts Error: ', error)
        return Response.json({ message: 'An error occurred' }, { status: 500 })
    }
}