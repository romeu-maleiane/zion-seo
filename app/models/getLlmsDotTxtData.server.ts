import prisma from "../db.server";

interface GetLlmsDotTxtDataProps {
  storeId: string;
}

export const getLlmsDotTxtData = async ({ storeId }: GetLlmsDotTxtDataProps) => {
  try {
    const store = await prisma.store.findUnique({
      where: { storeId },
      select: { storeId: true, storeName: true, storeDomain: true },
    });
    if (!store) throw new Error("Store data not found");

    const [productData, collectionData, blogData, pageData, llmsDotTxtConfigData] = await Promise.all([
      prisma.product.findMany({
        where: { storeId, showForLlms: true },
        select: { title: true, currentMetaTitle: true, currentMetaDescription: true, productUrl: true, productPrice: true },
      }),
      prisma.collection.findMany({
        where: { storeId, showForLlms: true },
        select: { title: true, collectionUrl: true },
      }),
      prisma.blog.findMany({ where: { storeId }, select: { title: true, blogUrl: true } }),
      prisma.page.findMany({ where: { storeId }, select: { title: true, pageUrl: true } }),
      prisma.lLMDotTxtConfig.findFirst({
        where: { storeId },
        select: {
          llmDotTxtDescription: true,
          includeProducts: true,
          includeCollections: true,
          includeBlogs: true,
          includePages: true,
          selectChatGPT: true,
          selectGemini: true,
          selectGrok: true,
          selectDeepSeek: true,
          selectClaude: true,
          selectPerplexity: true,
        },
      }),
    ]);

    if (!llmsDotTxtConfigData) throw new Error("LLMs.txt config data not found");
    return { storeData: store, productData, collectionData, blogData, pageData, llmsDotTxtConfigData };
  } catch (error) {
    console.error("Get LLMs.txt Data Error: ", error);
    return undefined;
  }
};