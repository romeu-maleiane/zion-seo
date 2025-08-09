
type CollectionType = {
    collectionId: string;
    collectionImage: string | null;
    title: string;
}

interface handleFetchNextCollectionsForModalProps {
    query?: string
    shopId: string
}

export const handleFetchNextCollectionsForModal = async ({ query, shopId }: handleFetchNextCollectionsForModalProps) => {
    const storeId = shopId.replace('gid://shopify/Shop/', '');
    const result = await fetch(`/app/api/llm-dot-txt/getcollections/${storeId}?search=${query}`)

    const collectionData = await result.json()
    const collectionsAsResources = collectionData.map((collection: CollectionType) => ({
            id: collection.collectionId,
            image: collection.collectionImage,
            title: collection.title,
        }))
    const resources = collectionsAsResources

    return { resources }
}