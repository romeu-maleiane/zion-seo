import type { LoaderFunctionArgs, } from "@remix-run/node";
import { useLoaderData, } from "@remix-run/react";
import { ArrowUpIcon, ArrowDownIcon } from '@shopify/polaris-icons';

import {
  Page,
  Layout,
  Text,
  Card,
  Button,
  BlockStack,
  Box,
  Link,
  InlineStack,
  InlineGrid,
  ProgressBar,
  Icon,
} from "@shopify/polaris";
import { authenticate } from "../../shopify.server";
import Footer from "app/Components/footer.component";
import { getShopMetrics } from "app/utils/getShoMetrics.server";


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
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);

  const response = await admin.graphql(
    `#graphql
  query shopInfo {
    shop {
      id
    }
  }`,
  );

  const data = await response.json()

  const shopId: string = data.data.shop.id

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
  },
    { status: 200 });
};

export default function Index() {
  const data: Data = useLoaderData();

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
  } = data;


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
          <Card >
            <Box paddingBlockEnd='400'>
              <Text as={"h3"} variant="headingLg" fontWeight='bold' children={`Store Information`} />
            </Box>
            <InlineGrid gap="400" columns={{ xs: 1, sm: 2, md: 3, lg: 4 }}>
              <div style={{ minWidth: '25%', maxWidth: '100%' }}>
                <Card >
                  <BlockStack gap="200">
                    <Text as="h4" variant="headingMd" fontWeight="semibold">
                      Products
                    </Text>
                    <Text as="h5" variant="headingLg" fontWeight='bold'>
                      {countOfProducts}
                    </Text>
                    <Text as="p" variant="bodyMd" >
                      Total Products
                    </Text>
                  </BlockStack>
                </Card>
              </div>

              <div style={{ minWidth: '25%', maxWidth: '100%' }}>
                <Card >
                  <BlockStack gap="200">
                    <Text as="h4" variant="headingMd" fontWeight="semibold">
                      Optimized Products
                    </Text>
                    <InlineStack blockAlign='center' gap="200">
                      <Text as="h5" variant="headingLg" fontWeight='bold'>
                        {countOfOptimizedProducts}
                      </Text>
                      <InlineStack blockAlign='center' gap="0">
                        {noDataOfOptimizedProductsYet
                          ? 
                            <Text as='span' tone='base' variant="bodyLg" fontWeight='semibold'>
                              No data yet
                            </Text>
                          : <>
                            <div style={{ width: 20, height: 20, }}>
                              {percentageAdvanceOfOptimizedProducts < 0
                                ? <Icon source={ArrowDownIcon} tone='critical' />
                                : <Icon source={ArrowUpIcon} tone='success' />
                              }
                            </div>
                            <Text as="span" variant="bodyMd" fontWeight='regular' tone="subdued">
                              {percentageAdvanceOfOptimizedProducts < 0
                                ? <Text as='span' tone='base' variant="bodyMd" fontWeight='regular'>
                                  <Text as='span' tone='critical' variant="bodyLg" fontWeight='semibold'>
                                    {Math.floor(percentageAdvanceOfOptimizedProducts)}%
                                  </Text>
                                  &nbsp;last week
                                </Text>
                                : <Text as='span' tone="subdued" variant="bodyMd" fontWeight='regular'>
                                  <Text as='span' tone='success' variant="bodyLg" fontWeight='semibold'>
                                    {percentageAdvanceOfOptimizedProducts}%
                                  </Text>
                                  &nbsp;last week
                                </Text>
                              }
                            </Text>
                          </>
                        }
                      </InlineStack>
                    </InlineStack>
                    <Text as="p" variant="bodyMd" >
                      Total Optimized Products
                    </Text>
                  </BlockStack>
                </Card>
              </div>

              <div style={{ minWidth: '25%', maxWidth: '100%' }}>
                <Card >
                  <BlockStack gap="200">
                    <Text as="h4" variant="headingMd" fontWeight="semibold">
                      Optimized Descriptions
                    </Text>
                    <InlineStack blockAlign='center' gap="200">
                      <Text as="h5" variant="headingLg" fontWeight='bold'>
                        {countOfOptimizedDescriptions}
                      </Text>
                      <InlineStack blockAlign='center' gap="0">
                        {noDataOfDescriptionsYet
                          ? 
                            <Text as='span' tone='base' variant="bodyLg" fontWeight='semibold'>
                              No data yet
                            </Text>
                          : <>
                            <div style={{ width: 20, height: 20, }}>
                              {percentageAdvanceOfOptimizedDescriptions < 0
                                ? <Icon source={ArrowDownIcon} tone='critical' />
                                : <Icon source={ArrowUpIcon} tone='success' />
                              }
                            </div>
                            <Text as="span" variant="bodyMd" fontWeight='regular' tone="subdued">
                              {percentageAdvanceOfOptimizedDescriptions < 0
                                ? <Text as='span' tone='base' variant="bodyMd" fontWeight='regular'>
                                  <Text as='span' tone='critical' variant="bodyLg" fontWeight='semibold'>
                                    {Math.floor(percentageAdvanceOfOptimizedDescriptions)}%
                                  </Text>
                                  &nbsp;last week
                                </Text>
                                : <Text as='span' tone="subdued" variant="bodyMd" fontWeight='regular'>
                                  <Text as='span' tone='success' variant="bodyLg" fontWeight='semibold'>
                                    {percentageAdvanceOfOptimizedDescriptions}%
                                  </Text>
                                  &nbsp;last week
                                </Text>
                              }
                            </Text>
                          </>
                        }
                      </InlineStack>
                    </InlineStack>
                    <Text as="p" variant="bodyMd" >
                      Total Optimized  Descriptions
                    </Text>
                  </BlockStack>
                </Card>
              </div>

              <div style={{ minWidth: '25%', maxWidth: '100%' }}>
                <Card >
                  <BlockStack gap="200">
                    <Text as="h4" variant="headingMd" fontWeight="semibold">
                      Optimized Meta Data
                    </Text>
                    <InlineStack blockAlign='center' gap="200">
                      <Text as="h5" variant="headingLg" fontWeight='bold'>
                        {countOfOptimizedMetaData}
                      </Text>
                      <InlineStack blockAlign='center' gap="0">
                        {noDataOfMetaDataYet
                          ? 
                            <Text as='span' tone='base' variant="bodyLg" fontWeight='semibold'>
                              No data yet
                            </Text>
                          : <>
                            <div style={{ width: 20, height: 20, }}>
                              {percentageAdvanceOfOptimizedMetaData < 0
                                ? <Icon source={ArrowDownIcon} tone='critical' />
                                : <Icon source={ArrowUpIcon} tone='success' />
                              }
                            </div>
                            <Text as="span" variant="bodyMd" fontWeight='regular' tone="subdued">
                              {percentageAdvanceOfOptimizedMetaData < 0
                                ? <Text as='span' tone='base' variant="bodyMd" fontWeight='regular'>
                                  <Text as='span' tone='critical' variant="bodyLg" fontWeight='semibold'>
                                    {Math.floor(percentageAdvanceOfOptimizedMetaData)}%
                                  </Text>
                                  &nbsp;last week
                                </Text>
                                : <Text as='span' tone="subdued" variant="bodyMd" fontWeight='regular'>
                                  <Text as='span' tone='success' variant="bodyLg" fontWeight='semibold'>
                                    {percentageAdvanceOfOptimizedMetaData}%
                                  </Text>
                                  &nbsp;last week
                                </Text>
                              }
                            </Text>
                          </>
                        }
                      </InlineStack>
                    </InlineStack>
                    <Text as="p" variant="bodyMd" >
                      Total Optimized Meta Data
                    </Text>
                  </BlockStack>
                </Card>
              </div>

            </InlineGrid>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card >
            <BlockStack gap="200">
              <InlineStack align='space-between' blockAlign='start'>

                <div>
                  <Text as="h3" variant="headingSm" fontWeight="bold">
                    AI SEO Optimizer
                  </Text>
                  <Text as='p' variant="bodyMd" fontWeight='regular'>
                    (20 AI credits)
                  </Text>
                </div>

                <Button
                  variant='primary'
                  onClick={() => {
                    window.location.reload();
                  }}>
                  Increase limit
                </Button>
              </InlineStack>

              <div>
                <Text as='p' variant="bodyMd" fontWeight='regular'>
                  0/20 Credits
                </Text>

                <div style={{ width: '100%' }}>
                  <ProgressBar progress={75} size='small' />
                </div>
              </div>
            </BlockStack>
          </Card>
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
                        <Link url='/optimize-product-description'>
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
                        <Link url='/optimize-meta-data'>
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
