import { BlockStack, Box, Text, Button, Card, Form, FormLayout, InlineStack, Layout, Page, TextField, Thumbnail, Icon, Tag, Divider, Link } from '@shopify/polaris'
import {
  MagicIcon,
  PlusCircleIcon,
  XCircleIcon
} from '@shopify/polaris-icons';
import { Image } from "@unpic/react"
import "../styles/customStyle.css";
import { GraphqlQueryError } from "@shopify/shopify-api";
import type { LoaderFunctionArgs, } from "@remix-run/node";
import { authenticate } from "app/shopify.server";
import prisma from "app/db.server";
import { useLoaderData } from "@remix-run/react";
import { useCallback, useEffect, useState } from 'react';


type Data = {
    productData: {
        productId: string;
        productImage: string | null;
        title: string;
        currentMetaTitle: string;
        currentMetaDescription: string;
        createdAt: Date | string;
    }
    storeId: string;
    aiCredits: number | null;
}

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { id } = params
  const completProductId = ('gid://shopify/Product/').concat('', id || '')
  const { admin } = await authenticate.admin(request);

  try {
    const shop = await admin.graphql(
      `#graphql
            query shopInfo {
                shop {
                    id
                }
            }`,
    );

    const shopData = await shop.json()

    const productData = await prisma.product.findUnique({
      where: { productId: completProductId },
      select: {
        productId: true,
        productImage: true,
        title: true,
        currentMetaTitle: true,
        currentMetaDescription: true,
        createdAt: true,
      }
    })

    const storeBalance = await prisma.store.findUnique({
      where: { storeId: shopData.data.shop.id },
      select: {
        aiCredits: true,
      },
    })


    return Response.json({ productData, storeId: shopData.data.shop.id, aiCredits: storeBalance?.aiCredits }, { status: 200 })
  } catch (error) {
    if (error instanceof GraphqlQueryError) {

      console.error('Meta Data Optimizer Error: ', error)
      return Response.json({ errors: error.body?.errors }, { status: 500 });
    }
    console.error('Meta Data Optimizer Error: ', error)
    return Response.json({ message: "An error occurred" }, { status: 500 });
  }
}
function OptimizeMetaDataPage() {
  const data: Data = useLoaderData()
  const [metaTittle, setMetaTitle] = useState<string>('')
  const [metaDescription, setMetaDescription] = useState<string>('')
  const [keyWordInput, setKeyWordInput] = useState<string>('')
  const [keyWords, setKeyWords] = useState<Array<string>>(['hi', 'hi', 'hi',])
  const [suggestedKeyWords, setSuggestedKeyWords] = useState<Array<string>>(['hello', 'hello', 'hello',])
  const { productData, aiCredits } = data

  useEffect(() => {
    setMetaDescription(productData.currentMetaDescription)
    setMetaTitle(productData.currentMetaTitle)
  },[productData.currentMetaDescription, productData.currentMetaTitle])

  const handleOnChangeMetaTitle = useCallback((value: string) => setMetaTitle(value),[])
  const handleOnChangeMetaDescription = useCallback((value: string) => setMetaDescription(value),[])
  const handleOnChangeKeyWordInput = useCallback((value: string) => setKeyWordInput(value),[])

  const handleAddKeyWord = useCallback(() => {
    const arrayOfKeyWords = keyWordInput.split(',')
      .map(keyWord => keyWord.trim())
      .filter(keyWord => keyWord.length > 0)
    
    setKeyWords( prev => {
      const newKeyWords = new Set(...prev, ...arrayOfKeyWords)
      return [...newKeyWords]
    })

  },[keyWordInput])

  const handleRemoveKeyWord = useCallback((index: number) => {
    setKeyWords( prev => {
      const newKeyWords = prev.splice(index,1)
      return newKeyWords
    })
  },[])

  const handleAddSuggestedKeyWord = useCallback((index: number) => {
    setKeyWords( prev => {
      const newKeyWords = new Set(...prev, suggestedKeyWords[index])
      return [...newKeyWords]
    })

    setSuggestedKeyWords( prev => {
      const newKeyWords = prev.splice(index,1)
      return newKeyWords
    })
  },[suggestedKeyWords])

  return (
    <Page title={`${productData.title}`}>
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
                    source={productData.productImage || '/assets/imgs/placeholder.png'}
                    size="large"
                    alt="Product Image"
                  />
                </BlockStack>
                <Box >
                  <TextField
                    value={metaTittle}
                    onChange={handleOnChangeMetaTitle}
                    label="Meta Title"
                    type="text"
                    maxLength={70}
                    autoComplete="meta title"
                  />
                  {/* <Text as='span'> hello fadsdwdadadawda</Text> */}
                </Box>
                <Box >
                  <TextField
                    value={metaDescription}
                    onChange={handleOnChangeMetaDescription}
                    label="Meta Description"
                    type="text"
                    maxLength={165}
                    multiline={5}
                    autoComplete="meta description"
                  />
                </Box>

                <BlockStack>
                  <InlineStack blockAlign='end' align='space-between'>
                    <div style={{ width: '85%' }}>
                      <TextField
                        value={keyWordInput}
                        onChange={handleOnChangeKeyWordInput}
                        label="Provide keywords for our AI"
                        type="text"
                        autoComplete="Provide keywords for our AI"
                      />
                    </div>
                    <div style={{ width: '13%' }}>
                      <Button onClick={handleAddKeyWord} fullWidth size="large">Add</Button>
                    </div>
                  </InlineStack>
                  {keyWords && 
                    <Box>
                      <InlineStack gap='200' align='start'>
                        {keyWords.map((keyWord, index) => (
                          <Tag key={index}>
                              <InlineStack gap='100'>
                                <span>{keyWord}</span>
                                <span onClick={() => handleRemoveKeyWord(index)}><Icon source={XCircleIcon} /></span>
                              </InlineStack>
                          </Tag>
                        ))}
                      </InlineStack>
                    </Box>
                  }
                </BlockStack>
                  
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
                          <div className='ai-text-color'>
                            <InlineStack gap='100'>
                              <span>{keyWord}</span>
                              <span onClick={() => handleAddSuggestedKeyWord(index)}><Icon source={PlusCircleIcon} /></span>
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
            <BlockStack gap='100'>
              <InlineStack gap='200' wrap={false}>
                <Image src='/assets/imgs/ia.png' width={40} height={40} alt='ia' />
                <BlockStack>
                  <div className='ai-text-color'>
                    <Text as='h2' variant="headingLg" fontWeight='medium'>AI Meta title/description optimizer</Text>
                  </div>
                  <Text as='p'>
                    Optimize your meta titles and meta descriptions with the power of AI
                  </Text>
                </BlockStack>
              </InlineStack>
              <Box paddingBlockStart='100'>
                <Button fullWidth variant='primary' icon={MagicIcon} size='medium'>
                  Generate
                </Button>
              </Box>
              <InlineStack align='space-between'>
                <Text as='span'>{aiCredits} Credits available</Text>
                <div className='ai-text-color'>
                  <Link removeUnderline url='sasa'>Buy Credits</Link>
                </div>
              </InlineStack>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  )
}

export default OptimizeMetaDataPage
