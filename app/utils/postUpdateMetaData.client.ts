import type { UpdateMetaDataType } from "app/types/updateMetaData.type";


export const postUpdateMetaData = async ({ productId, newMetaTitle, newMetaDescription }: UpdateMetaDataType) => {
    try {
        const formData = new FormData()
    
        formData.append('productId', productId)
        formData.append('metaTitle', newMetaTitle)
        formData.append('metaDescription', newMetaDescription)
    
        const response = await fetch('/app/api/update-meta-data', {
            method: 'POST',
            body: formData
        })

        if(response.status === 500) throw new Error("An error occured fetching update meta data");
        
        const data = await response.json()

        const { newMetaData } = data

        return newMetaData
    } catch (error) {
        console.error('Post Product Update Error: ', error)
        return null
    }    

}