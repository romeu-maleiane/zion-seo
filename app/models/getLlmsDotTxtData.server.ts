import prisma from '../db.server'


interface getLlmsDotTxtDataProps {
    storeDomain: string
}

export const getLlmsDotTxtData = async ({ storeDomain }: getLlmsDotTxtDataProps) => {
    try {
        const store = await prisma.store.findFirst({
            where: { storeDomain: storeDomain },
            select: { 
                storeId: true, 
                storeName: true,
            }
        })
        const storeId = store?.storeId || '0'

        const storeData = { ...store, storeDomain}

        const [productData, collectionData, blogData, pageData, llmsDotTxtConfigData] = await Promise.all([
            prisma.product.findMany({
                where: {
                    storeId: storeId,
                    showForLlms: true
                },
                select: {
                    title: true,
                    currentMetaTitle: true,
                    currentMetaDescription: true, 
                    productUrl: true,
                    productPrice: true,
                }
            }),
            prisma.collection.findMany({
                where: {
                    storeId: storeId,
                    showForLlms: true
                },
                select: {
                    title: true,
                    collectionUrl: true
                }
            }),
            prisma.blog.findMany({
                where: { storeId: storeId },
                select: {
                    title: true,
                    blogUrl: true
                }
            }),
            prisma.page.findMany({
                where: { storeId: storeId },
                select: {
                    title: true,
                    pageUrl: true
                }
            }),
            prisma.lLMDotTxtConfig.findFirst({
                where: { storeId: storeId },
                select: {
                    llmDotTxtDescription: true,
                    includeProducts: true,
                    includeCollections: true,
                    includeBlogs: true,
                    includePages: true,
                    selectChatGPT: true,
                    selectGemini: true,
                    selectGrok: true,
                    selectDeepSeek: true,
                    selectClaude: true,
                    selectPerplexity: true
                }
            })
        ])

        if(!storeData) throw new Error("Store data not found");
        if(!productData) throw new Error("Product data not found");
        if(!llmsDotTxtConfigData) throw new Error("LLMs.txt config data not found");
        

        return { storeData, productData, collectionData, blogData, pageData, llmsDotTxtConfigData}
    } catch (error) {
        console.error('Get LLMs.txt Data Error: ', error)
        return
    }
}