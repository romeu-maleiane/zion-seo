import type { OptimizeMetaDataType } from "app/types/azureOpenAI.types";


export const fetchOptimizedMetaData = async ({
    productTitle,
    keywords,
    metaTitle,
    metaDescription }: OptimizeMetaDataType) => {

    try {
        const formData = new FormData()
        console.log('Keywords :', keywords)

        formData.append('productTitle', productTitle)
        formData.append('keywords', keywords)
        formData.append('metaTitle', metaTitle || '')
        formData.append('metaDescription', metaDescription || '')

        const res = await fetch('/app/api/get-optimized-meta-data', {
            method: 'POST',
            body: formData
        })

        const optimizedMetaData = await res.json()

        if (optimizedMetaData?.status === 'error') throw new Error('An error occured fetching optimizedMetaData')

        return optimizedMetaData
    } catch (error) {
        console.error('fetch Optimized Meta Data Error: ', error)
        return null
    }
}