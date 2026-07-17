import type { LoaderFunctionArgs } from "@remix-run/node";
import prisma from "app/db.server";
import { authenticateAdminShop } from "app/utils/authenticatedShop.server";


export const loader = async ({ params, request }: LoaderFunctionArgs) => {
    try {

        const { page } = params
        const { shopId } = await authenticateAdminShop(request)
        const completedStoreId = shopId
        const pageSize = 20

        const url = new URL(request.url);
        const search = url.searchParams.get("search") || undefined;



        const result = await prisma.product.findMany({
            skip: parseInt(page || '1') * pageSize,
            take: pageSize + 1,
            where: {
                storeId: completedStoreId,
                title: search ? { search } : undefined
            },
            select: {
                productId: true,
                productImage: true,
                title: true,
            }
        })

        const hasNextPage = result.length > pageSize
        const currentProducts = result.slice(0, pageSize)

        return Response.json({
            currentProducts,
            hasNextPage,
        }, { status: 200 })
    } catch (error) {
        console.error('Get Next Collections API Route Error: ', error)
        return Response.json({
            currentProducts: [],
            hasNextPage: false
        }, { status: 500 })
    }
} 