import type { UpdateMetaDataType } from 'app/types/updateMetaData.type';
import prisma from '../db.server'


export const updateMetaData = async ({ productId, newMetaTitle, newMetaDescription }: UpdateMetaDataType) => {
    try {
        const updatedMetaData = await prisma.product.update({
            where: {
                productId: productId,
            },
            data: {
                generatedMetaTitle: newMetaTitle,
                generatedMetaDescription: newMetaDescription,
                currentMetaTitle: newMetaTitle,
                currentMetaDescription: newMetaDescription
            }
        })

        if (!updatedMetaData) throw new Error("Product not found");

        const newMetaData: { 
            generatedMetaTitle: string | null, 
            generatedMetaDescription: string | null, 
            currentMetaTitle: string | null, 
            currentMetaDescription: string | null 
        } = updatedMetaData

        return newMetaData
    } catch (error) {
        console.error('Update Meta Data Error: ', error)
        return null
    }
}