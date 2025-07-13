

interface FetchGeneratedDescriptionsProps {
    productTitle: string
    brandName: string
    productDetails: string
    keywords?: string
}

export const fetchGeneratedDescriptions = async ({
    productTitle,
    brandName,
    productDetails,
    keywords, }: FetchGeneratedDescriptionsProps) => {

    try {
        const formData = new FormData()

        formData.append('productTitle', productTitle)
        formData.append('brandName', brandName)
        formData.append('productDetails', productDetails)
        formData.append('keywords', keywords || '')

        const res = await fetch('/app/api/get-generated-descriptions', {
            method: 'POST',
            body: formData
        })

        if (res.status === 500) throw new Error('An error occured fetching generate descriptions')

        const generatedDescriptions = await res.json()
        
        return generatedDescriptions
    } catch (error) {
        console.error('fetch Generated Descriptions Error: ', error)
        return null
    }
}