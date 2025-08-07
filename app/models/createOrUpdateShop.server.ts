import  prisma  from '../db.server'

interface CreateOrUpdateShopType {
    id: string
    name: string
    domain: string
    email: string
}

export const createOrUpdateShop = async ({id, name, domain, email, }: CreateOrUpdateShopType) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const createdOrUpdatedStore = await prisma.store.upsert({
    create: {
      storeId: id,
      storeName: name,
      email: email,
      storeDomain: domain,
      activePlan: 'free',
      aiCredits: 50
    },
    update: {
      storeName: name,
      email: email,
      storeDomain: domain,
    },
    where: {
      storeId: id
    }
  })

  return Response.json({ createdOrUpdatedStore }, { status: 200 })
  } catch(error) {
    console.error('CreateOrUpdateShop Error: ',error)
    return Response.json({ message: 'An error occurred' }, { status: 500 })
  }
}