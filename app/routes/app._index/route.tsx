import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  Button,
  BlockStack,
  Box,
  List,
  Link,
  InlineStack,
  InlineGrid,
  ProgressBar,
} from "@shopify/polaris";
import { TitleBar, } from "@shopify/app-bridge-react";
import { authenticate } from "../../shopify.server";


type Data = {
  
}

export const loader = async ({ request }: ActionFunctionArgs) => {
  const { admin, } = await authenticate.admin(request);

  return Response.json({
    
  },
    { status: 200 });
};

export default function Index() {
  const data: Data = useLoaderData();


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
        <Text as={"h1"} variant="heading3xl" fontWeight="bold" children="Dashboard"></Text>
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
                  <BlockStack gap="300">
                    <Text as="h4" variant="headingMd" fontWeight="semibold">
                      Products
                    </Text>
                    <Box>
                      <Text as="h5" variant="headingLg" fontWeight='bold'>
                        10
                      </Text>
                      <Text as="p" variant="bodyMd" >
                        Total Products
                      </Text>
                    </Box>
                  </BlockStack>
                </Card>
              </div>

              <div style={{ minWidth: '25%', maxWidth: '100%' }}>
                <Card >
                  <BlockStack gap="300">
                    <Text as="h4" variant="headingMd" fontWeight="semibold">
                      Optimized Products
                    </Text>
                    <Box>
                      <Text as="h5" variant="headingLg" fontWeight='bold'>
                        10
                      </Text>
                      <Text as="p" variant="bodyMd" >
                        Total Optimized Products
                      </Text>
                    </Box>
                  </BlockStack>
                </Card>
              </div>

              <div style={{ minWidth: '25%', maxWidth: '100%' }}>
                <Card >
                  <BlockStack gap="300">
                    <Text as="h4" variant="headingMd" fontWeight="semibold">
                      Optimized Descriptions
                    </Text>
                    <Box>
                      <Text as="h5" variant="headingLg" fontWeight='bold'>
                        10
                      </Text>
                      <Text as="p" variant="bodyMd" >
                        Total Optimized  Descriptions
                      </Text>
                    </Box>
                  </BlockStack>
                </Card>
              </div>
              <div style={{ minWidth: '25%', maxWidth: '100%' }}>
                <Card >
                  <BlockStack gap="300">
                    <Text as="h4" variant="headingMd" fontWeight="semibold">
                      Optimized Meta Data
                    </Text>
                    <Box>
                      <Text as="h5" variant="headingLg" fontWeight='bold'>
                        10
                      </Text>
                      <Text as="p" variant="bodyMd" >
                        Total Optimized Meta Data
                      </Text>
                    </Box>
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
                  primary
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
      </Layout>
    </Page>
  );
}
