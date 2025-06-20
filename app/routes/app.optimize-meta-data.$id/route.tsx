import { BlockStack, Box, Text, Button, Card, Form, FormLayout, InlineStack, Layout, Page, TextField, Thumbnail, Grid, Icon, Tag, LegacyStack, Divider } from '@shopify/polaris'
import {
  MagicIcon,
  PlusCircleIcon
} from '@shopify/polaris-icons';
import "../styles/customStyle.css";


function OptimizeMetaDataPage() {
  const suggestedKeyWords = ['hello', 'hello', 'hello',]

  return (
    <Page title="Product Name">
      <Layout>
        <Layout.Section>
          <Card>
            <Box paddingBlockEnd='300'>
              <Text as='h2' variant="headingLg" fontWeight='medium'>Optimize SEO</Text>
              <Box paddingBlockStart='100'>
                <Divider />
              </Box>
            </Box>

            <Form onSubmit={() => { }}>
              <FormLayout>
                <BlockStack gap='100'>
                  <Text as='span'>Product Image</Text>
                  <Thumbnail
                    source="https://burst.shopifycdn.com/photos/black-leather-choker-necklace_373x@2x.jpg"
                    size="large"
                    alt="Black choker necklace"
                  />
                </BlockStack>
                <Box >
                  <TextField
                    value={''}
                    onChange={() => { }}
                    label="Meta Title"
                    type="text"
                    maxLength={70}
                    autoComplete="meta title"
                  />
                  {/* <Text as='span'> hello fadsdwdadadawda</Text> */}
                </Box>
                <Box >
                  <TextField
                    value={''}
                    onChange={() => { }}
                    label="Meta Description"
                    type="text"
                    maxLength={165}
                    multiline={5}
                    autoComplete="meta description"
                  />
                </Box>

                <InlineStack blockAlign='end' align='space-between'>
                  <div style={{ width: '85%' }}>
                    <TextField
                      value={''}
                      onChange={() => { }}
                      label="Provide keywords for our AI"
                      type="text"
                      autoComplete="Provide keywords for our AI"
                    />
                  </div>
                  <div style={{ width: '13%' }}>
                    <Button fullWidth size="large">Add</Button>
                  </div>
                </InlineStack>

                <BlockStack inlineAlign='start' gap='100'>
                  <Text as='span'>Click to add these suggested keywords for our AI engine:</Text>
                  <InlineStack gap='200' align='start'>
                    <div className='icon-color'>

                      <Icon
                        source={MagicIcon}
                      />
                    </div>
                    {suggestedKeyWords.map((keyWord, index) => (
                      <div key={index} className='suggested-keyword-tag-background-color'>
                        <Tag >
                          <div className='suggested-keyword-text-color'>
                            <InlineStack gap='100'>
                              <span>{keyWord}</span>
                              <span onClick={() => { }}><Icon source={PlusCircleIcon} /></span>

                            </InlineStack>
                          </div>
                        </Tag>
                      </div>
                    ))}
                  </InlineStack>
                </BlockStack>
                
                <InlineStack align='end'>
                  <Button size="large" submit>Post</Button>
                </InlineStack>
              </FormLayout>
            </Form>
          </Card>

          <Box paddingBlockStart='300' >
            <Card >
              <Box paddingBlockEnd='300'>
                <Text as='h2' variant="headingLg" fontWeight='medium'>Preview snippet</Text>
                <Box paddingBlockStart='100'>
                  <Divider />
                </Box>
              </Box>
              <p>
                Use to follow a normal section with a secondary section to create
                a 2/3 + 1/3 layout on detail pages (such as individual product or
                order pages). Can also be used on any page that needs to structure
                a lot of content. This layout stacks the columns on small screens.
              </p>
            </Card>
          </Box>
        </Layout.Section>
        <Layout.Section variant="oneThird">
          <Card  >
            <p>Add tags to your order.</p>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  )
}

export default OptimizeMetaDataPage
