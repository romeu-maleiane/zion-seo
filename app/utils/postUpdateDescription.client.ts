

interface PostUpdateProductDescriptionProps {
    productId: string 
    newProductDescription: string
}

export const postUpdateProductDescription = async ({ productId, newProductDescription }: PostUpdateProductDescriptionProps) => {
    try {
        const formData = new FormData()
    
        formData.append('productId', productId)
        formData.append('newProductDescription', newProductDescription)
    
        const response = await fetch('/app/api/update-description', {
            method: 'POST',
            body: formData
        })

        if(response.status === 500) throw new Error("An error occured fetching update description");
        
        const data = await response.json()

        const { newDescription } = data

        return newDescription
    } catch (error) {
        console.error('Post Update Product Description Error: ', error)
        return null
    }    

}