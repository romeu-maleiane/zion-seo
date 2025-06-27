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
import { authenticate } from "../../shopify.server";
import Footer from "app/Components/footer.component";
import { createOrUpdateShop } from "app/models/createOrUpdateShop.server"
import { GraphqlQueryError } from '@shopify/shopify-api';
import StoreInformationComponent from "app/Components/storeInformation.component";
import { createOrUpdateProducts } from "app/models/createOrUpdateProduct.server";
import CardAiSeoOptimizer from "app/Components/cardAiSeoOptimizer";
import { getShopMetrics } from "app/models/getShoMetrics.server";
import { useLoaderData } from "@remix-run/react";
import prisma from "app/db.server";

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
    const shop = await admin.graphql(
      `#graphql
      query shopInfo {
        shop {
          id
          name
          primaryDomain {
            host
          }
          email
        }
      }`,
    );

    const shopData = await shop.json()

    const { createdOrUpdatedStore } = await createOrUpdateShop({
      id: shopData.data.shop.id,
      name: shopData.data.shop.name,
      email: shopData.data.shop.email,
      domain: shopData.data.shop.primaryDomain.host
    }).then(response => response.json())

    let products;

    if (createdOrUpdatedStore.activePlan === 'free') {
      products = await admin.graphql(
        `#graphql
        query GetFirst250Products {
          products(first: 25 ) {
            edges {
              cursor
              node {
                id                
                title             
                description
                createdAt
                variants(first: 1) {
                  nodes {
                    price
                  }
                }       
                seo {
                  title           
                  description     
                }
                featuredMedia {
                  mediaContentType
                  ... on MediaImage {
                    image {
                      url
                    }
                  }            
                }
              }
            }
          }
        }`,
      )

    } else {
      products = await admin.graphql(
        `#graphql
        query GetFirst250Products {
          products( first: 250 ) {
            edges {
              cursor
              node {
                id                
                title             
                description
                createdAt
                variants(first: 1) {
                  nodes {
                    price
                  }
                }       
                seo {
                  title           
                  description     
                }
                featuredMedia {
                  mediaContentType
                  ... on MediaImage {
                    image {
                      url
                    }
                  }            
                }
              }
            }
          }
        }`,
      )
    }

    const productsData = await products.json()

    await createOrUpdateProducts(productsData.data.products.edges, shopData.data.shop.id)

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

    const storeBalance = await prisma.store.findUnique({
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
      activePlan: storeBalance?.activePlan,
      aiCredits: storeBalance?.aiCredits
    }, { status: 200 });

  } catch (error) {
    if (error instanceof GraphqlQueryError) {

      return Response.json({ errors: error.body?.errors }, { status: 500 });
    }
    console.error('Dashboard Error: ', error)
    return Response.json({ message: "An error occurred" }, { status: 500 });
  }
}


export default function Index() {
  const data: Data = useLoaderData()


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

  //   const shopify = useAppBridge();
  //   const isLoading =
  //     ["loading", "submitting"].includes(fetcher.state) &&
  //     fetcher.formMethod === "POST";
  //   const productId = fetcher.data?.product?.id.replace(
  //     "gid://shopify/Product/",
  //     "",
  //   );


  //   const publishProduct = () => fetcher.submit({}, { method: "POST" });

  return (
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
                        Create high-conversion descriptions for your products
                      </Text>

                      <div style={{ width: 225 }}>
                        <Link url='/app/optimize-product-description'>
                          <Button >
                            Optimize description
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
                        <Link url='/app/optimize-meta-data'>
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
