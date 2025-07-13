import prisma from '../db.server'

interface UpdatedProductDescription {
    productId: string
    newProductDescription: string
}

export const updatedProductDescription = async ({ productId, newProductDescription }: UpdatedProductDescription) => {
    try {
        const updatedDescription = await prisma.product.update({
            where: {
                productId: productId,
            },
            data: {
                currentDescription: newProductDescription,
                generatedDescription: newProductDescription,
                descriptionOptimizedAt: new Date()
            }
        })

        if (!updatedDescription) throw new Error("Product not found");

        const newDescription: { 
            currentDescription: string | null 
            generatedDescription: string | null, 
        } = updatedDescription

        return newDescription
    } catch (error) {
        console.error('Update Description Error: ', error)
        return null
    }
}