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
import { SHOP_INFO_QUERY } from "app/utils/graphqlQuerysAndMutations";
import Footer from "app/Components/footer.component";
import { createOrUpdateShop } from "app/models/createOrUpdateShop.server"
import { GraphqlQueryError } from '@shopify/shopify-api';
import StoreInformationComponent from "app/Components/storeInformation.component";
import CardAiSeoOptimizer from "app/Components/cardAiSeoOptimizer";
import { getShopMetrics } from "app/models/getShoMetrics.server";
import { authenticateAdminShop } from "app/utils/authenticatedShop.server";
import { useFetcher, useLoaderData, useNavigation } from "@remix-run/react";
import prisma from "app/db.server";
import SkeletonTablePage from "app/Components/skeletonTablePage";
import { useEffect } from "react";

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
  const { admin, shopId } = await authenticateAdminShop(request);

  try {
    let store = await prisma.store.findUnique({
      where: { storeId: shopId },
      select: { activePlan: true, aiCredits: true },
    });
    if (!store) {
      const shop = await admin.graphql(SHOP_INFO_QUERY);
      const shopData = await shop.json();
      const created = await createOrUpdateShop({
        id: shopId,
        name: shopData.data.shop.name,
        email: shopData.data.shop.email,
        domain: shopData.data.shop.primaryDomain.host,
      });
      if (!created.ok) throw new Error("Unable to create store");
      store = await prisma.store.findUnique({ where: { storeId: shopId }, select: { activePlan: true, aiCredits: true } });
    }
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
    } = await getShopMetrics({ shopId })

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
      activePlan: store?.activePlan ?? null,
      aiCredits: store?.aiCredits ?? null
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
  const syncFetcher = useFetcher<{ synced?: boolean; message?: string }>();
  useEffect(() => {
    if (syncFetcher.data?.synced) shopify.toast.show("Catalog sync completed successfully.");
    if (syncFetcher.data?.message) shopify.toast.show(syncFetcher.data.message, { isError: true });
  }, [syncFetcher.data]);

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
        <InlineGrid columns={{ xs: 1, sm: 2 }} gap="300" alignItems="center">
          <Text as={"h2"} variant="headingMd" fontWeight='regular' children={`Welcome to ZionSEO`} />
          <div style={{ justifySelf: "end" }}>
            <Button variant="primary" tone="success" loading={syncFetcher.state !== "idle"} onClick={() => syncFetcher.submit(null, { method: "post", action: "/app/api/sync-catalog" })}>
              Sync catalog
            </Button>
          </div>
        </InlineGrid>
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
