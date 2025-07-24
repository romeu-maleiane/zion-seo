import prisma from '../db.server'

interface CreateOrUpdateCollectionsType {
    id: string
    title: string
    description: string | null
    handle: string
    image: {
        url: string | null
    }
}

export const createOrUpdateCollections = async (collectionsData: Array<CreateOrUpdateCollectionsType>, shopDomain: string, shopId: string) => {
    if (collectionsData.length === 0 || !collectionsData) return

    try {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const createdsCollectionsOrUpdateds = collectionsData.map(async (collection) => {

            const collectionImage = collection?.image?.url
                ? collection.image.url
                : 'https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-image_large.png';

            const collectionUrl = `https://${shopDomain}/collections/${collection.handle}`
            const collectionCreatedOrUpdated = await prisma.collection.upsert({
                where: {
                    collectionId: collection.id,
                },
                update: {
                    collectionImage,
                    collectionUrl,
                    storeId: shopId,
                    title: collection.title,
                    description: collection.description || '',
                },
                create: {
                    collectionId: collection.id,
                    collectionImage,
                    collectionUrl,
                    title: collection.title,
                    description: collection.description || '',
                    store: {
                        connect: { storeId: shopId }
                    },
                },
            })

            return collectionCreatedOrUpdated
        })

    } catch (error) {
        console.error('CreateOrUpdateCollections Error: ', error)
    }
}