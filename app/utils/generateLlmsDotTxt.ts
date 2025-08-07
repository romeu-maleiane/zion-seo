

interface generateLlmsDotTxtProps {
    data: {
        storeData: {
            storeDomain: string;
            storeId?: string | undefined;
            storeName?: string | undefined;
        }
        productData: {
            title: string;
            productUrl: string | null;
            productPrice: number | null
            currentMetaTitle: string;
            currentMetaDescription: string;
        }[]
        collectionData: {
            title: string;
            collectionUrl: string;
        }[]
        blogData: {
            title: string;
            blogUrl: string;
        }[]
        pageData: {
            title: string;
            pageUrl: string;
        }[]
        llmsDotTxtConfigData: {
            llmDotTxtDescription: string | null
            includeProducts: boolean
            includeCollections: boolean
            includeBlogs: boolean
            includePages: boolean
            selectChatGPT: boolean
            selectGemini: boolean
            selectGrok: boolean
            selectDeepSeek: boolean
            selectClaude: boolean
            selectPerplexity: boolean
        }
    }
}

// generating the file llms.txt 
export const generateLlmsDotTxt = ({ data }: generateLlmsDotTxtProps) => {
    const llmsDotTxt = 
`
- [${data.storeData.storeName || ''}] (https://${data.storeData.storeDomain})

${data.llmsDotTxtConfigData.llmDotTxtDescription || ''}

${data.llmsDotTxtConfigData.includeCollections ? `# Product categories
${data.collectionData.map(collection => `- [${collection.title}] (${collection.collectionUrl})`).join('\n')}
` : ''}

${data.llmsDotTxtConfigData.includeProducts ? `# Products
${data.productData.map(product => `- [${product.currentMetaTitle || product.title}] (${product.productUrl})
Description: ${product.currentMetaDescription || 'Without meta description'}
Price: ${product.productPrice}
`).join('\n')}
` : ''}

${data.llmsDotTxtConfigData.includeBlogs ? `# Blogs
${data.blogData.map(blog => `- [${blog.title}] (${blog.blogUrl})`).join('\n')}
` : ''}

${data.llmsDotTxtConfigData.includePages ? `# Pages
${data.pageData.map(page => `- [${page.title}] (${page.pageUrl})`).join('\n')}
` : ''}

# Optional
- [robots.txt] (https://${data.storeData.storeDomain}/robots.txt)
- [sitemap.xml] (https://${data.storeData.storeDomain}/sitemap.xml)
`.trim();

    return llmsDotTxt
}