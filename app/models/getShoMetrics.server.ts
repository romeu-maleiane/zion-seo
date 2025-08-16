import { subDays, startOfWeek, endOfWeek } from 'date-fns'
import prisma from '../db.server'



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
  try {

    const today = new Date()

    const lastSunday = startOfWeek(subDays(today, 7), { weekStartsOn: 0 })

    const lastSaturday = endOfWeek(subDays(today, 7), { weekStartsOn: 0 })

    const startOfThisWeek = startOfWeek(new Date(), { weekStartsOn: 0 })


    const [
      countOfProducts,
      countOfOptimizedProducts,
      countOfOptimizedDescriptions,
      countOfOptimizedMetaData,
      countOfOptimizedProductsOfLastWeek,
      countOfOptimizedProductsOfThisWeek,
      countOfOptimizedDescriptionsOfLastWeek,
      countOfOptimizedDescriptionsOfThisWeek,
      countOfOptimizedMetaDataOfLastWeek,
      countOfOptimizedMetaDataOfThisWeek,
    ] = await Promise.all([
      prisma.product.count({ where: { storeId: shopId } }),
      prisma.product.count({
        where: {
          storeId: shopId,
          AND: [
            {
              generatedDescription: { not: null },
              generatedMetaTitle: { not: null },
              generatedMetaDescription: { not: null }
            },
          ],
        },
      }),
      prisma.product.count({
        where: {
          storeId: shopId,
          NOT: [{ generatedDescription: null }],
        },
      }),
      prisma.product.count({
        where: {
          storeId: shopId,
          AND: [
            {
              generatedMetaTitle: { not: null },
              generatedMetaDescription: { not: null }
            },
          ],
        },
      }),
      prisma.product.count({
        where: {
          descriptionOptimizedAt: { gte: lastSunday, lte: lastSaturday },
          metaDataOptimizedAt: { gte: lastSunday, lte: lastSaturday },
          storeId: shopId,
          AND: [
            {
              generatedDescription: { not: null },
              generatedMetaTitle: { not: null },
              generatedMetaDescription: { not: null }
            },
          ],
        },
      }),
      prisma.product.count({
        where: {
          descriptionOptimizedAt: { gte: startOfThisWeek },
          metaDataOptimizedAt: { gte: startOfThisWeek },
          storeId: shopId,
          AND: [
            {
              generatedDescription: { not: null },
              generatedMetaTitle: { not: null },
              generatedMetaDescription: { not: null }
            },
          ],
        },
      }),
      prisma.product.count({
        where: {
          descriptionOptimizedAt: { gte: lastSunday, lte: lastSaturday },
          storeId: shopId,
          NOT: [{ generatedDescription: null, }],
        },
      }),
      prisma.product.count({
        where: {
          descriptionOptimizedAt: { gte: startOfThisWeek },
          storeId: shopId,
          NOT: [{ generatedDescription: null }],
        },
      }),
      prisma.product.count({
        where: {
          metaDataOptimizedAt: { gte: lastSunday, lte: lastSaturday },
          storeId: shopId,
          AND: [
            {
              generatedMetaTitle: { not: null },
              generatedMetaDescription: { not: null }
            },
          ],
        },
      }),
      prisma.product.count({
        where: {
          metaDataOptimizedAt: { gte: startOfThisWeek },
          storeId: shopId,
          AND: [
            {
              generatedMetaTitle: { not: null },
              generatedMetaDescription: { not: null }
            },
          ],
        },
      }),
    ]);

    // Calculating metrics of optimized Products
    const noDataOfOptimizedProductsYet = countOfOptimizedProductsOfLastWeek === 0 && countOfOptimizedProductsOfThisWeek === 0

    const percentageAdvanceOfOptimizedProducts = !countOfOptimizedProductsOfLastWeek ? 100 * countOfOptimizedProductsOfThisWeek
      : (100 * countOfOptimizedProductsOfThisWeek / countOfOptimizedProductsOfLastWeek) - 100

    // Calculating metrics of optimized Descriptions
    const noDataOfDescriptionsYet = countOfOptimizedDescriptionsOfLastWeek === 0 && countOfOptimizedDescriptionsOfThisWeek === 0

    const percentageAdvanceOfOptimizedDescriptions = !countOfOptimizedDescriptionsOfLastWeek ? 100 * countOfOptimizedDescriptionsOfThisWeek
      : (100 * countOfOptimizedDescriptionsOfThisWeek / countOfOptimizedDescriptionsOfLastWeek) - 100

    // Calculating metrics of optimized Meta Data
    const noDataOfMetaDataYet = countOfOptimizedMetaDataOfLastWeek === 0 && countOfOptimizedMetaDataOfThisWeek === 0

    const percentageAdvanceOfOptimizedMetaData = !countOfOptimizedMetaDataOfLastWeek ? 100 * countOfOptimizedMetaDataOfThisWeek
      : (100 * countOfOptimizedMetaDataOfThisWeek / countOfOptimizedMetaDataOfLastWeek) - 100


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
  } catch (error) {
    console.error('GetShopMetrics Error: ', error)
    throw new Error('Failed to get shop metrics')
  }
}