import type { LoaderFunctionArgs } from "@remix-run/node";
import prisma from "app/db.server";


export const loader = async ({ params, request }: LoaderFunctionArgs) => {
    const { storeId, page } = params
    const completedStoreId = ('gid://shopify/Shop/').concat('', storeId || '')
    const pageSize = 15

    const url = new URL(request.url);
    const search = url.searchParams.get("search") || undefined;
    const onlyNotOptimizedProducts = url.searchParams.get("onlyNotOptimizedProducts") || undefined;
    const onlyOptimizedProducts = url.searchParams.get("onlyOptimizedProducts") || undefined;

    console.log(`onlyNotOptimizedProducts: ${onlyNotOptimizedProducts} | onlyOptimizedProducts: ${onlyOptimizedProducts}`);

    let result;

    if (onlyNotOptimizedProducts === 'true') {
        result = await prisma.product.findMany({
            skip: parseInt(page || '1') * pageSize,
            take: pageSize + 1,
            where: {
                storeId: completedStoreId,
                title: search ? { search } : undefined,
                AND: [
                    { generatedMetaTitle: null },
                    { generatedMetaDescription: null }],
            },
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
    }
    else if (onlyOptimizedProducts === 'true') {
        result = await prisma.product.findMany({
            skip: parseInt(page || '1') * pageSize,
            take: pageSize + 1,
            where: {
                storeId: completedStoreId,
                title: search ? { search } : undefined,
                NOT: [
                    { generatedMetaTitle: null },
                    { generatedMetaDescription: null }
                ],
            },
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
    }
    else {
        result = await prisma.product.findMany({
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
                currentMetaTitle: true,
                currentMetaDescription: true,
                generatedDescription: true,
                generatedMetaTitle: true,
                createdAt: true,
            }
        })
    }

    const hasNextPage = result.length > pageSize
    const currentProducts = result.slice(0, pageSize)

    return Response.json({
        products: currentProducts,
        hasNextPage,
    }, { status: 200 })
} 