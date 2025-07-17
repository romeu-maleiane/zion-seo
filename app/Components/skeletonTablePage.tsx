import {
  SkeletonPage,
  Layout,
  Card,
  SkeletonBodyText,
  BlockStack,
  SkeletonTabs,
} from '@shopify/polaris';


function SkeletonTablePage() {
  return (
    <SkeletonPage>
          <Layout>
            <Layout.Section>
              <BlockStack gap='300'>
                <Card >
                  <SkeletonBodyText />
                </Card>
                <Card>
                  <BlockStack>
                    <SkeletonTabs />
                    <SkeletonBodyText lines={10}/>
                  </BlockStack>
                </Card>
              </BlockStack>
            </Layout.Section>
          </Layout>
        </SkeletonPage>
  )
}

export default SkeletonTablePage
