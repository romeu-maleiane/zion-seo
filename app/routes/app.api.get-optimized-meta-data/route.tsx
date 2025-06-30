import type { ActionFunctionArgs } from "@remix-run/node";
import { optimizeMetaData } from "app/utils/optimizeMetaData.server";

export const action = async ({ request }: ActionFunctionArgs) => {
    try {
        const formData = await request.formData()

        const productTitle = formData.get('productTitle')
        const keywords = formData.get('keywords')
        const metaTitle = formData.get('metaTitle')
        const metaDescription = formData.get('metaDescription')
        console.log('Keywords :', keywords)

        if (typeof productTitle !== 'string' || !productTitle) throw new Error('Missing or invalid productTitle');
        if (typeof keywords !== 'string' || !keywords) throw new Error('Missing or invalid keywords');
        if (typeof metaTitle !== 'string' ) throw new Error('Invalid metaTitle');
        if (typeof metaDescription !== 'string') throw new Error('Invalid metaDescription');

        const optimizedMetaData = await optimizeMetaData({ productTitle, keywords, metaTitle, metaDescription })

        return optimizedMetaData
    } catch (error) {
        console.error('Fetch Meta Data Error: ', error)
        return Response.json({ message: 'An error occured fetching optimizedMetaData' }, { status: 500 })
    }
}