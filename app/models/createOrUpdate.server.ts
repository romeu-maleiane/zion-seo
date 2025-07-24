import prisma from '../db.server'

interface CreateOrUpdatePagesType {
    id: string
    title: string
    handle: string
}

export const createOrUpdatePages = async (pagesData: Array<CreateOrUpdatePagesType>, shopDomain: string, shopId: string) => {
    if (pagesData.length === 0 || !pagesData) return

    try {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const createdsPagesOrUpdateds = pagesData.map(async (page) => {

            const pageUrl = `https://${shopDomain}/pages/${page.handle}`
            const pageCreatedOrUpdated = await prisma.page.upsert({
                where: {
                    pageId: page.id,
                },
                update: {
                    pageUrl,
                    storeId: shopId,
                    title: page.title,
                },
                create: {
                    pageId: page.id,
                    pageUrl,
                    title: page.title,
                    store: {
                        connect: { storeId: shopId }
                    },
                },
            })

            return pageCreatedOrUpdated
        })

    } catch (error) {
        console.error('CreateOrUpdatePages Error: ', error)
    }
}