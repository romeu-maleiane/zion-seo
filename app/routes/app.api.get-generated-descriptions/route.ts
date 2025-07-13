import type { ActionFunctionArgs } from "@remix-run/node";
import { generateDescription } from "app/utils/generateDescription.server";

export const action = async ({ request }: ActionFunctionArgs) => {
    try {
        const formData = await request.formData()

        const productTitle = formData.get('productTitle')
        const keywords = formData.get('keywords')
        const brandName = formData.get('brandName')
        const productDetails = formData.get('productDetails')

        if (typeof productTitle !== 'string' || !productTitle) throw new Error('Missing or invalid productTitle');
        if (typeof brandName !== 'string' ) throw new Error('Invalid brandName');
        if (typeof productDetails !== 'string') throw new Error('Invalid productDetails');
        if (typeof keywords !== 'string') throw new Error('Missing or invalid keywords');

        const generatedDescriptions = await generateDescription({ productTitle, brandName, productDetails, keywords, })

        return Response.json(generatedDescriptions , { status: 200 })
    } catch (error) {
        console.error('Fetch Generated Descriptions Error: ', error)
        return Response.json({ message: 'An error occured fetching generated description api route' }, { status: 500 })
    }
}