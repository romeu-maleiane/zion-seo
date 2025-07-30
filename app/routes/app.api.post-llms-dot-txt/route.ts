import type { ActionFunctionArgs } from "@remix-run/node";
import { postLlmsDotTxt } from "app/models/postLlmsDotTxt.server";

type CrawlersType = {
    label: string
    id: string
    status: boolean
}

export const action = async ({ request }: ActionFunctionArgs) => {
    const formData = await request.formData()

    try {
        
        const storeId: string = formData.get('storeId') as string || ''
        const description: string = formData.get('description') as string || ''
        const includeProducts: boolean = formData.get('includeProducts') === 'true';
        const includeCollections: boolean = formData.get('includeCollections') === 'true'
        const productRadioResult: 'all' | 'selected' | 'except' = formData.get('productRadioResult') as 'all' | 'selected' | 'except' || 'all'
        const collectionRadioResult: 'all' | 'selected' | 'except' = formData.get('collectionRadioResult') as 'all' | 'selected' | 'except' || 'all'
        const savedSelectedProducts: string[] = JSON.parse(formData.get('savedSelectedProducts') as string)
        const savedSelectedCollections: string[] = JSON.parse(formData.get('savedSelectedCollections') as string)
        const savedExceptSelectedProducts: string[] = JSON.parse(formData.get('savedExceptSelectedProducts') as string)
        const savedExceptSelectedCollections: string[] = JSON.parse(formData.get('savedExceptSelectedCollections') as string)
        const includeBlogs: boolean = formData.get('includeBlogs') === 'true'
        const includePages: boolean = formData.get('includePages') === 'true'
        const crawlers: Array<CrawlersType> = JSON.parse(formData.get('crawlers') as string)

        const response = await postLlmsDotTxt({
            storeId,
            description,
            includeProducts,
            includeCollections,
            productRadioResult,
            collectionRadioResult,
            savedSelectedProducts,
            savedSelectedCollections,
            savedExceptSelectedProducts,
            savedExceptSelectedCollections,
            includeBlogs,
            includePages,
            crawlers
        })

        if(response.status === 500) 
            throw new Error('An error occured posting LLMs.txt data')

        return Response.json({ message: 'LLMs.txt was post ssuccesfuly' }, { status: 200 })
    } catch (error) {
        console.error('Api Post LLMS.txt Error:', error);
        return Response.json({message: 'Internal Server Error'}, { status: 500 });

    }
}