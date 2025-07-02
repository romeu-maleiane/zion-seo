import type { ActionFunctionArgs } from "@remix-run/node";
import prisma from "app/db.server";

export const action = async ({ request }: ActionFunctionArgs) => {
    try {
        const formData = await request.formData()
        
        const shopId = formData.get('shopId')
        const aiCredits = formData.get('aiCredits')
        const creditsToBeSubtracted = formData.get('creditsToBeSubtracted')

        if (typeof shopId !== 'string' || !shopId) throw new Error('Missing or invalid shopId');
        if (typeof aiCredits !== 'string' || !aiCredits) throw new Error('Missing or invalid aiCredits');
        if (typeof creditsToBeSubtracted !== 'string' || !creditsToBeSubtracted) throw new Error('Missing or invalid creditsToBeSubtracted');

        const newData = await prisma.store.update({
            where: {
                storeId: shopId
            },
            data: {
                aiCredits: +aiCredits - +creditsToBeSubtracted
            }
        })

        if(!newData) throw new Error("Update aiCredits failed");

        const newAiCredits: { aiCredits: number } = newData

        return Response.json(newAiCredits, { status: 200})
    } catch (error) {
        console.error('Update aiCredits Error: ', error)
        return Response.json({ message: 'An error occured updating aiCredits' }, { status: 500 })
    }


}