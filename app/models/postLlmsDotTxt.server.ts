import prisma from '../db.server'


interface PostLlmsDotTxtProps {
    storeId: string
    description: string
    includeProducts: boolean
    includeCollections: boolean
    productRadioResult: 'all' | 'selected' | 'except'
    collectionRadioResult: 'all' | 'selected' | 'except'
    savedSelectedProducts: string[]
    savedSelectedCollections: string[]
    savedExceptSelectedProducts: string[]
    savedExceptSelectedCollections: string[]
    includeBlogs: boolean
    includePages: boolean
    crawlers: Array<{
        label: string
        id: string
        status: boolean
    }>
}

export const postLlmsDotTxt = async ({
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
    crawlers }: PostLlmsDotTxtProps) => {

    try {

        // Handle product updates
        let productData;
        if (productRadioResult === 'all') {
            productData = await prisma.product.updateMany({
                where: {
                    storeId: storeId,
                    showForLlms: false
                },
                data: {
                    showForLlms: true
                }
            });
        }
        else if (productRadioResult === 'selected') {
            await Promise.all([
                prisma.product.updateMany({
                    where: {
                        storeId: storeId,
                        productId: { in: savedSelectedProducts }
                    },
                    data: {
                        showForLlms: true
                    }
                }),
                prisma.product.updateMany({
                    where: {
                        storeId: storeId,
                        productId: { notIn: savedSelectedProducts }
                    },
                    data: {
                        showForLlms: false
                    }
                }),
            ]);
            productData = true;
        }
        else if (productRadioResult === 'except') {
            await Promise.all([
                prisma.product.updateMany({
                    where: {
                        storeId: storeId,
                        productId: { in: savedExceptSelectedProducts }
                    },
                    data: {
                        showForLlms: false
                    }
                }),
                prisma.product.updateMany({
                    where: {
                        storeId: storeId,
                        productId: { notIn: savedExceptSelectedProducts }
                    },
                    data: {
                        showForLlms: true
                    }
                }),
            ]);
            productData = true;
        }

        // Handle collection updates
        let collectionData;
        if (collectionRadioResult === 'all') {
            collectionData = await prisma.collection.updateMany({
                where: {
                    storeId: storeId,
                    showForLlms: false
                },
                data: {
                    showForLlms: true
                }
            });
        }
        else if (collectionRadioResult === 'selected') {
            await Promise.all([
                prisma.collection.updateMany({
                    where: {
                        storeId: storeId,
                        collectionId: { in: savedSelectedCollections }
                    },
                    data: {
                        showForLlms: true
                    }
                }),
                prisma.collection.updateMany({
                    where: {
                        storeId: storeId,
                        collectionId: { notIn: savedSelectedCollections }
                    },
                    data: {
                        showForLlms: false
                    }
                }),
            ]);
            collectionData = true;
        }
        else if (collectionRadioResult === 'except') {
            await Promise.all([
                prisma.collection.updateMany({
                    where: {
                        storeId: storeId,
                        collectionId: { in: savedExceptSelectedCollections }
                    },
                    data: {
                        showForLlms: false
                    }
                }),
                prisma.collection.updateMany({
                    where: {
                        storeId: storeId,
                        collectionId: { notIn: savedExceptSelectedCollections }
                    },
                    data: {
                        showForLlms: true
                    }
                }),
            ]);
            collectionData = true;
        }


        let chatgpt: boolean = false
        let gemini: boolean = false
        let grok: boolean = false
        let deepseek: boolean = false
        let claude: boolean = false
        let perplexity: boolean = false

        // Add crawlers status
        crawlers.forEach(crawler => {
            if (crawler.id === 'chatgpt') chatgpt = crawler.status
            else if (crawler.id === 'gemini') gemini = crawler.status
            else if (crawler.id === 'grok') grok = crawler.status
            else if (crawler.id === 'deepseek') deepseek = crawler.status
            else if (crawler.id === 'claude') claude = crawler.status
            else if (crawler.id === 'perplexity') perplexity = crawler.status

            return crawler
        })

        // verifing the value for products and collections fields in LLMs.txt config table
        const dataToUpdadeLlmsConfing = () => {
            const selectAllProductsValue = productRadioResult === 'all'
            const selectedProductsValue = productRadioResult === 'selected'
            const exceptSelectedProductsValue = productRadioResult === 'except'
            
            const selectAllCollectionsValue = collectionRadioResult === 'all'
            const selectedCollectionsValue = collectionRadioResult === 'selected'
            const exceptSelectedCollectionsValue = collectionRadioResult === 'except'
            
            return {
                llmDotTxtDescription: description,
                includeProducts: includeProducts,
                includeCollections: includeCollections,
                includeBlogs: includeBlogs,
                includePages: includePages,
                selectAllProducts: selectAllProductsValue,
                selectedProducts: selectedProductsValue,
                exceptSelectedProducts: exceptSelectedProductsValue,
                selectAllCollections: selectAllCollectionsValue,
                selectedCollections: selectedCollectionsValue,
                exceptSelectedCollections: exceptSelectedCollectionsValue,
                selectChatGPT: chatgpt,
                selectGemini: gemini,
                selectGrok: grok,
                selectDeepSeek: deepseek,
                selectClaude: claude,
                selectPerplexity: perplexity,
            }
        }

        // Handle llmDotTxtConfig update
        let llmDotTxtConfig;
        llmDotTxtConfig = await prisma.lLMDotTxtConfig.updateMany({
            where: {
                storeId: storeId
            },
            data: dataToUpdadeLlmsConfing()
        })

        if (!productData || !collectionData || !llmDotTxtConfig)
            throw new Error("Something went wrong updating llms.txt data");

        return { status: 200 }
    } catch (error) {
        console.error('Post LLMs.txt Data Error: ', error)
        return { status: 500 }
    }

}