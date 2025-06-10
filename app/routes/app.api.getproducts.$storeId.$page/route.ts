import type { LoaderFunctionArgs } from "@remix-run/node";
import prisma from "app/db.server";


export const loader = async ({ params }: LoaderFunctionArgs) => {
    const { storeId, page } = params
    const completedStoreId = ('gid://shopify/Shop/').concat('',storeId || '')
    const pageSize = 15

    const result = await prisma.product.findMany({
        skip: parseInt(page || '1') * pageSize,
        take: pageSize + 1,
        where: { storeId: completedStoreId },
        select: {
            productId: true,
            productImage: true,
            title: true,
            currentMetaTitle: true,
            currentMetaDescription: true,
            generatedDescription: true,
            generatedMetaTitle: true,
            createdAt: true,
        }
    })

    const hasNextPage = result.length > pageSize
    const currentProducts = result.slice(0, pageSize)

    return Response.json({
        products: currentProducts,
        hasNextPage,
    }, { status: 200 })
} 