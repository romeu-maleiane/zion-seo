import type { LoaderFunctionArgs, } from "@remix-run/node";
import {
  Page,
  Layout,
  Text,
  Card,
  Button,
  BlockStack,
  Box,
  Link,
  InlineGrid,
} from "@shopify/polaris";
import {
  SHOP_INFO_QUERY,
  PRODUCTS_QUERY_FREE,
  PRODUCTS_QUERY_STARTER,
  PRODUCTS_QUERY_PRO,
  COLLECTIONS_QUERY,
  BLOGS_QUERY,
  PAGES_QUERY,
} from "app/utils/graphqlQuerysAndMutations";
import { authenticate } from "../../shopify.server";
import Footer from "app/Components/footer.component";
import { createOrUpdateShop } from "app/models/createOrUpdateShop.server"
import { GraphqlQueryError } from '@shopify/shopify-api';
import StoreInformationComponent from "app/Components/storeInformation.component";
import { createOrUpdateProducts } from "app/models/createOrUpdateProduct.server";
import CardAiSeoOptimizer from "app/Components/cardAiSeoOptimizer";
import { getShopMetrics } from "app/models/getShoMetrics.server";
import { reconcileCreditCycle } from "app/models/creditLifecycle.server";
import { useLoaderData, useNavigation } from "@remix-run/react";
import prisma from "app/db.server";
import SkeletonTablePage from "app/Components/skeletonTablePage";
import { createOrUpdateCollections } from "app/models/createOrUpdateCollection.server";
import { createOrUpdateBlogs } from "app/models/createOrUpdateBlog.server";
import { createOrUpdatePages } from "app/models/createOrUpdate.server";

type Data = {
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
  activePlan: string | null;
  aiCredits: number | null;
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);

  try {
    const shop = await admin.graphql(SHOP_INFO_QUERY);

    const shopData = await shop.json()
    const shopId = shopData.data.shop.id
    const shopName = shopData.data.shop.name
    const shopEmail = shopData.data.shop.email
    const shopDomain = shopData.data.shop.primaryDomain.host

    const { createdOrUpdatedStore } = await createOrUpdateShop({
      id: shopId,
      name: shopName,
      email: shopEmail,
      domain: shopDomain
    }).then(response => response.json())

    await reconcileCreditCycle(shopId);
    const storeBalance = await prisma.store.findUnique({
      where: { storeId: shopId },
      select: { activePlan: true, aiCredits: true },
    });
    const activePlan = storeBalance?.activePlan || createdOrUpdatedStore.activePlan;

    let products;

    if (activePlan === 'free') {
      products = await admin.graphql(PRODUCTS_QUERY_FREE);
    } else if (activePlan === 'starter') {
      products = await admin.graphql(PRODUCTS_QUERY_STARTER);
    } else {
      products = await admin.graphql(PRODUCTS_QUERY_PRO);
    }

    const [collections, blogs, pages] = await Promise.all([
      admin.graphql(COLLECTIONS_QUERY),
      admin.graphql(BLOGS_QUERY),
      admin.graphql(PAGES_QUERY),
    ]);

    const [productsData, collectionsData, blogsData, pagesData] = await Promise.all([
      products.json(),
      collections.json(),
      blogs.json(),
      pages.json(),
    ]);

    await Promise.all([
      createOrUpdateProducts(productsData.data.products.edges, shopId),
      createOrUpdateCollections(collectionsData.data.collections.nodes, shopDomain, shopId),
      createOrUpdateBlogs(blogsData.data.blogs.nodes, shopDomain, shopId),
      createOrUpdatePages(pagesData.data.pages.nodes, shopDomain, shopId),
    ]);

    const {
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
    } = await getShopMetrics({ shopId: shopData.data.shop.id })

    const latestStoreBalance = await prisma.store.findUnique({
      where: { storeId: shopData.data.shop.id },
      select: {
        activePlan: true,
        aiCredits: true,
      },
    })

    return Response.json({
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
      activePlan: latestStoreBalance?.activePlan,
      aiCredits: latestStoreBalance?.aiCredits
    }, { status: 200 });

  } catch (error) {
    if (error instanceof GraphqlQueryError) {
      console.error('Dashboard Graphql Error: ', error.body?.errors)
      return Response.json({ message: "Something went wroang loading data" }, { status: 500 });
    }
    console.error('Dashboard Loader Error: ', error)
    return Response.json({ message: "Something went wroang loading data" }, { status: 500 });
  }
}


export default function Index() {
  const data: Data = useLoaderData()
  const navigation = useNavigation()
  const isLoading = navigation.state === 'loading'

  const { countOfProducts,
    countOfOptimizedProducts,
    countOfOptimizedDescriptions,
    countOfOptimizedMetaData,
    percentageAdvanceOfOptimizedProducts,
    percentageAdvanceOfOptimizedDescriptions,
    percentageAdvanceOfOptimizedMetaData,
    noDataOfOptimizedProductsYet,
    noDataOfDescriptionsYet,
    noDataOfMetaDataYet,
    activePlan,
    aiCredits } = data


  return isLoading ? (
    <SkeletonTablePage />
  ) : (
    <Page>

      <Box paddingBlockEnd='200'>
        <Text as={"h1"} variant="heading2xl" fontWeight="bold" children="Dashboard"></Text>
      </Box>

      <Box paddingBlockEnd='300'>
        <Text as={"h2"} variant="headingMd" fontWeight='regular' children={`Welcome to ZionSEO`} />
      </Box>

      <Layout>

        <Layout.Section>
          <StoreInformationComponent countOfProducts={countOfProducts}
            countOfOptimizedProducts={countOfOptimizedProducts}
            countOfOptimizedDescriptions={countOfOptimizedDescriptions}
            countOfOptimizedMetaData={countOfOptimizedMetaData}
            percentageAdvanceOfOptimizedProducts={percentageAdvanceOfOptimizedProducts}
            percentageAdvanceOfOptimizedDescriptions={percentageAdvanceOfOptimizedDescriptions}
            percentageAdvanceOfOptimizedMetaData={percentageAdvanceOfOptimizedMetaData}
            noDataOfOptimizedProductsYet={noDataOfOptimizedProductsYet}
            noDataOfDescriptionsYet={noDataOfDescriptionsYet}
            noDataOfMetaDataYet={noDataOfMetaDataYet}
          />
        </Layout.Section>

        <Layout.Section>
          <CardAiSeoOptimizer activePlan={activePlan} aiCredits={aiCredits} />
        </Layout.Section>

        <Layout.Section>
          <Card >
            <Box paddingBlockEnd='400'>
              <Text as={"h2"} variant="headingLg" fontWeight='bold' children={`Quick actions`} />
            </Box>

            <InlineGrid gap="400" columns={{ xs: 1, sm: 2 }}>
              <div style={{ minWidth: '25%', maxWidth: '100%' }}>
                <Card >
                  <BlockStack gap="300">
                    <Text as="h4" variant="headingMd" fontWeight="semibold">
                      Product description
                    </Text>
                    <BlockStack gap="200">
                      <Text as="p" variant="bodyLg" >
                        Generate high-conversion descriptions for your products
                      </Text>

                      <div style={{ width: 225 }}>
                        <Link url='/app/description-generator'>
                          <Button >
                            Generate description
                          </Button>
                        </Link>
                      </div>

                    </BlockStack>
                  </BlockStack>
                </Card>
              </div>

              <div style={{ minWidth: '25%', maxWidth: '100%' }}>
                <Card >
                  <BlockStack gap="300">
                    <Text as="h4" variant="headingMd" fontWeight="semibold">
                      Meta Title/Description
                    </Text>
                    <BlockStack gap="200">
                      <Text as="p" variant="bodyLg" >
                        Create optimized meta titles and descriptions in one click.
                      </Text>

                      <div style={{ width: 225 }}>
                        <Link url='/app/meta-data-optimizer'>
                          <Button >
                            Optimize meta data
                          </Button>
                        </Link>
                      </div>

                    </BlockStack>
                  </BlockStack>
                </Card>
              </div>

            </InlineGrid>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Footer />
        </Layout.Section>
      </Layout>
    </Page>
  );
}
