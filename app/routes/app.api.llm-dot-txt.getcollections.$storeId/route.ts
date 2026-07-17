import type { LoaderFunctionArgs } from "@remix-run/node";
import prisma from "app/db.server";
import { authenticateAdminShop } from "app/utils/authenticatedShop.server";


export const loader = async ({ params, request }: LoaderFunctionArgs) => {
    try {

        const { shopId } = await authenticateAdminShop(request)
        const completedStoreId = shopId

        const url = new URL(request.url);
        const search = url.searchParams.get("search") || undefined;



        const currentCollections = await prisma.collection.findMany({
            where: {
                storeId: completedStoreId,
                title: search ? { search } : undefined
            },
            select: {
                collectionId: true,
                collectionImage: true,
                title: true,
            }
        })

        return Response.json({
            currentCollections,
        }, { status: 200 })
    } catch (error) {
        console.error('Get Next Collections API Route Error: ', error)
        return Response.json({ 
            currentCollections: [] 
        }, { status: 500 })
    }
} 