import prisma from '../db.server'

interface CreateOrUpdateBlogsType {
    id: string
    title: string
    handle: string
}

export const createOrUpdateBlogs = async (blogsData: Array<CreateOrUpdateBlogsType>, shopDomain: string, shopId: string) => {
    if (blogsData.length === 0 || !blogsData) return

    try {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const createdsBlogsOrUpdateds = blogsData.map(async (blog) => {

            const blogUrl = `https://${shopDomain}/blogs/${blog.handle}`
            const blogCreatedOrUpdated = await prisma.blog.upsert({
                where: {
                    blogId: blog.id,
                },
                update: {
                    blogUrl,
                    storeId: shopId,
                    title: blog.title,
                },
                create: {
                    blogId: blog.id,
                    blogUrl,
                    title: blog.title,
                    store: {
                        connect: { storeId: shopId }
                    },
                },
            })

            return blogCreatedOrUpdated
        })

    } catch (error) {
        console.error('CreateOrUpdateBlogs Error: ', error)
    }
}