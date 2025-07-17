import {
  SkeletonPage,
  Layout,
  Card,
  SkeletonBodyText,
  BlockStack,
  SkeletonDisplayText,
} from '@shopify/polaris';

function SkeletonFeaturePage() {
  return (
    <SkeletonPage>
      <Layout>
        <Layout.Section>
          <BlockStack gap='300'>
            <Card >
              <SkeletonBodyText />
            </Card>
            <Card>
              <BlockStack gap='200'>
                <SkeletonDisplayText size="small" />
                <SkeletonBodyText />
              </BlockStack>
            </Card>
            <Card>
              <BlockStack gap='200'>
                <SkeletonDisplayText size="small" />
                <SkeletonBodyText />
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>
        <Layout.Section variant="oneThird">
            <Card>
              <BlockStack gap='200'>
                <Card>
                  <BlockStack gap='200'>
                    <SkeletonDisplayText size="small" />
                    <SkeletonBodyText lines={2} />
                  </BlockStack>
                </Card>
                <Card>
                  <SkeletonBodyText lines={1} />
                </Card>
              </BlockStack>
            </Card>
        </Layout.Section>
      </Layout>
    </SkeletonPage>
  );
}

export default SkeletonFeaturePage