
interface FetchPostLlmsDotTxtProps {
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

export const fetchPostLlmsDotTxt = async ({ 
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
    crawlers  }: FetchPostLlmsDotTxtProps) => {

    const formData = new FormData()

    formData.append('description', description || "")
    formData.append('includeProducts', String(includeProducts))
    formData.append('includeCollections', String(includeCollections))
    formData.append('productRadioResult', productRadioResult)
    formData.append('collectionRadioResult', collectionRadioResult)
    formData.append('savedSelectedProducts', JSON.stringify(savedSelectedProducts))
    formData.append('savedSelectedCollections', JSON.stringify(savedSelectedCollections))
    formData.append('savedExceptSelectedProducts', JSON.stringify(savedExceptSelectedProducts))
    formData.append('savedExceptSelectedCollections', JSON.stringify(savedExceptSelectedCollections))
    formData.append('includeBlogs', String(includeBlogs))
    formData.append('includePages', String(includePages))
    formData.append('crawlers', JSON.stringify(crawlers))

    try {
        const response = await fetch('/api/post-llms-txt', {
            method: 'POST',
            body: formData
        });
    
        if (response.status === 500) {
            throw new Error('Failed to post llms.txt data');
        }
    
        return response.json();
    } catch (error) {
        console.error('Fetch Post LLMs.txt Error: ', error)
    }

}