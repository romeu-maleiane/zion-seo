import { PrismaClient } from "@prisma/client"
import { subDays, startOfWeek, endOfWeek } from 'date-fns'


const prisma = new PrismaClient()

type Metrics = {
  countOfProducts: number;
  countOfOptimizedProducts: number;
  countOfOptimizedDescriptions: number;
  countOfOptimizedMetaData: number;
  percentageAdvanceOfOptimizedProducts: number;
  percentageAdvanceOfOptimizedDescriptions: number;
  percentageAdvanceOfOptimizedMetaData: number;
  noDataOfOptimizedProductsYet?: boolean;
  noDataOfDescriptionsYet?: boolean;
  noDataOfMetaDataYet?: boolean;
}

export const getShopMetrics = async ({ shopId }: { shopId: string }): Promise<Metrics> => {

  const countOfProducts = await prisma.product.count({
    where: { storeId: shopId },
  })
  const countOfOptimizedProducts = await prisma.product.count({
    where: {
      storeId: shopId,
      AND: [
        {
          generatedDescription: {
            not: null,
          },
        },
        {
          generatedMetaTitle: {
            not: null,
          },
        },
        {
          generatedMetaDescription: {
            not: null,
          },
        }
      ]
    },
  });
  const countOfOptimizedDescriptions = await prisma.product.count({
    where: {
      storeId: shopId,
      NOT: [
        {
          generatedDescription: null,
        }
      ]
    },
  });

  const countOfOptimizedMetaData = await prisma.product.count({
    where: {
      storeId: shopId,
      AND: [
        {
          generatedMetaTitle: {
            not: null,
          },
        },
        {
          generatedMetaDescription: {
            not: null,
          },
        }
      ]
    },
  });


  const today = new Date()

  // Domingo passado (início da semana anterior)
  const lastSunday = startOfWeek(subDays(today, 7), { weekStartsOn: 0 })

  // Sábado passado (fim da semana anterior)
  const lastSaturday = endOfWeek(subDays(today, 7), { weekStartsOn: 0 })
  
  const startOfThisWeek = startOfWeek(new Date(), { weekStartsOn: 0 })

  // Calculating metrics of optimized Products
  const countOfOptimizedProductsOfLastWeek = await prisma.product.count({
    where: {
      createdAt: {
        gte: lastSunday,
        lte: lastSaturday,
      },
      storeId: shopId,
      AND: [
        {
          generatedDescription: {
            not: null,
          },
        },
        {
          generatedMetaTitle: {
            not: null,
          },
        },
        {
          generatedMetaDescription: {
            not: null,
          },
        }
      ]
    },
  })

  const countOfOptimizedProductsOfThisWeek = await prisma.product.count({
    where: {
      createdAt: {
        gte: startOfThisWeek,
      },
      storeId: shopId,
      AND: [
        {
          generatedDescription: {
            not: null,
          },
        },
        {
          generatedMetaTitle: {
            not: null,
          },
        },
        {
          generatedMetaDescription: {
            not: null,
          },
        }
      ]
    },
  })

    const noDataOfOptimizedProductsYet = countOfOptimizedProductsOfLastWeek === 0 && countOfOptimizedProductsOfThisWeek === 0

    const percentageAdvanceOfOptimizedProducts = !countOfOptimizedProductsOfLastWeek ? 100 * countOfOptimizedProductsOfThisWeek  
    : (100 * countOfOptimizedProductsOfThisWeek / countOfOptimizedProductsOfLastWeek) - 100


  // Calculating metrics of optimized Descriptions
  const countOfOptimizedDescriptionsOfLastWeek = await prisma.product.count({
    where: {
      createdAt: {
        gte: lastSunday,
        lte: lastSaturday,
      },
      storeId: shopId,
      NOT: [
        {
          generatedDescription: null,
        }
      ]
    },
  })

  const countOfOptimizedDescriptionsOfThisWeek = await prisma.product.count({
    where: {
      createdAt: {
        gte: startOfThisWeek,
      },
      storeId: shopId,
      NOT: [
        {
          generatedDescription: null,
        }
      ]
    },
  }) 

  const noDataOfDescriptionsYet = countOfOptimizedDescriptionsOfLastWeek === 0 && countOfOptimizedDescriptionsOfThisWeek === 0

  const percentageAdvanceOfOptimizedDescriptions = !countOfOptimizedDescriptionsOfLastWeek ? 100 * countOfOptimizedDescriptionsOfThisWeek  
  : ( 100 * countOfOptimizedDescriptionsOfThisWeek / countOfOptimizedDescriptionsOfLastWeek ) - 100


  // Calculating metrics of optimized Meta Data
  const countOfOptimizedMetaDataOfLastWeek = await prisma.product.count({
    where: {
      createdAt: {
        gte: lastSunday,
        lte: lastSaturday,        
      },
      storeId: shopId,
      AND: [
        {
          generatedMetaTitle: {
            not: null,
          },
        },
        {
          generatedMetaDescription: {
            not: null,
          },
        }
      ]
    },
  })

  const countOfOptimizedMetaDataOfThisWeek = await prisma.product.count({
    where: {
      createdAt: {
        gte: startOfThisWeek,       
      },
      storeId: shopId,
      AND: [
        {
          generatedMetaTitle: {
            not: null,
          },
        },
        {
          generatedMetaDescription: {
            not: null,
          },
        }
      ]
    },
  }) 

  const noDataOfMetaDataYet = countOfOptimizedMetaDataOfLastWeek === 0 && countOfOptimizedMetaDataOfThisWeek === 0

  const percentageAdvanceOfOptimizedMetaData = !countOfOptimizedMetaDataOfLastWeek ? 100 * countOfOptimizedMetaDataOfThisWeek  
  : ( 100 * countOfOptimizedMetaDataOfThisWeek / countOfOptimizedMetaDataOfLastWeek ) - 100

  return {
    countOfProducts,
    countOfOptimizedProducts,
    countOfOptimizedDescriptions,
    countOfOptimizedMetaData,
    percentageAdvanceOfOptimizedProducts,
    percentageAdvanceOfOptimizedDescriptions,
    percentageAdvanceOfOptimizedMetaData,
    noDataOfOptimizedProductsYet,
    noDataOfDescriptionsYet,
    noDataOfMetaDataYet,
  }
}