import { BlockStack, Box, Text, Button, Card, Form, FormLayout, InlineStack, Layout, Page, TextField, Thumbnail, Icon, Tag, Divider, Link, Spinner } from '@shopify/polaris'
import {
  MagicIcon,
  MenuVerticalIcon,
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
import { suggestKeywords } from 'app/utils/suggestKeywords.server';
import { fetchOptimizedMetaData } from 'app/utils/fetchOptimizedMetData.client';


type Data = {
  productData: {
    productId: string;
    productImage: string | null;
    productPrice: string | null; 
    title: string;
    currentMetaTitle: string;
    currentMetaDescription: string;
    createdAt: Date | string;
  }
  storeId: string;
  aiCredits: number | null;
  keywords: string[] 
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
        }
      `,
    );

    const shopData = await shop.json()

    const productData = await prisma.product.findUnique({
      where: { productId: completProductId },
      select: {
        productId: true,
        productImage: true,
        productPrice: true,
        title: true,
        currentMetaTitle: true,
        currentMetaDescription: true,
        createdAt: true,
      }
    })

    if(!productData) return Response.json({ message: 'Product not found' }, { status: 404 })

    const keywordsData = await suggestKeywords({ productTitle: productData?.title || ''}) 

    if(keywordsData.status === 'error') throw new Error("Error fetching suggested keywords");

    const storeBalance = await prisma.store.findUnique({
      where: { storeId: shopData.data.shop.id },
      select: {
        aiCredits: true,
      },
    })


    return Response.json({ 
      productData, 
      storeId: shopData.data.shop.id, 
      aiCredits: storeBalance?.aiCredits,
      keywords: keywordsData.suggestedKeywords || [] 
    }, { status: 200 })
  } catch (error) {
    if (error instanceof GraphqlQueryError) {

      console.error('Meta Data Optimizer Error: ', error)
      return Response.json({ message: "An error occurred" }, { status: 500 });
    }
    console.error('Meta Data Optimizer Error: ', error)
    return Response.json({ message: "An error occurred" }, { status: 500 });
  }
}
function OptimizeMetaDataPage() {
  const data: Data = useLoaderData()
  const [metaTitle, setMetaTitle] = useState<string>('')
  const [metaDescription, setMetaDescription] = useState<string>('')
  const [optimizedMetaTitle, setOptimizedMetaTitle] = useState<string>('')
  const [optimizedMetaDescription, setOptimizedMetaDescription] = useState<string>('')
  const [showOptimizedMetaTitle, setShowOptimizedMetaTitle] = useState<boolean>(false)
  const [showOptimizedMetaDescription, setShowOptimizedMetaDescription] = useState<boolean>(false)
  const [keyWordInput, setKeyWordInput] = useState<string>('')
  const [keyWords, setKeyWords] = useState<Array<string>>([])
  const [suggestedKeyWords, setSuggestedKeyWords] = useState<Array<string>>([])
  const [loadingOptimizedMetaData, setLoadingOptimizedMetaData] = useState<boolean>(false)
  const { productData, aiCredits, keywords } = data


  useEffect(() => {
    setMetaDescription(productData?.currentMetaDescription || '')
    setMetaTitle(productData?.currentMetaTitle || '')
    setSuggestedKeyWords(keywords)
  }, [productData, keywords])

  const handleOnChangeMetaTitle = useCallback((value: string) => setMetaTitle(value), [])
  const handleOnChangeMetaDescription = useCallback((value: string) => setMetaDescription(value), [])
  const handleOnChangeKeyWordInput = useCallback((value: string) => setKeyWordInput(value), [])

  const handleAddKeyWord = useCallback(() => {
    const arrayOfKeyWords = keyWordInput.split(',')
      .map(keyWord => keyWord.trim())
      .filter(keyWord => keyWord.length > 0)

    setKeyWordInput('')

    setKeyWords(prev => {
      const newKeyWords = new Set([...prev, ...arrayOfKeyWords])
      return [...newKeyWords]
    })

  }, [keyWordInput])

  const handleRemoveKeyWord = useCallback((index: number) => {
    setKeyWords(prev => prev.filter((_, i) => i !== index))
  }, [])

  const handleAddSuggestedKeyWord = useCallback((index: number) => {
    setKeyWords(prev => {
      const newKeyWords = new Set([...prev, suggestedKeyWords[index]])
      return [...newKeyWords]
    })

    setSuggestedKeyWords(prev => prev.filter((_, i) => i !== index))
  }, [suggestedKeyWords])

  const handleFetchOptimizedMetaData = useCallback( async() => {
    try {
      setLoadingOptimizedMetaData(true)
  
      const stringOfKeywords = keywords.join(`, `)
      console.log('stringOfKeywords: ',stringOfKeywords)
  
      const optimizedMetaData = await fetchOptimizedMetaData({ productTitle: productData.title, keywords: stringOfKeywords, metaDescription:productData.currentMetaDescription, metaTitle: productData.currentMetaDescription})
      if(!optimizedMetaData) throw new Error("An error occured fetching optimized meta mata");
      
      setOptimizedMetaTitle(optimizedMetaData.optimizedMetaTitle)
      setOptimizedMetaDescription(optimizedMetaData.optimizedMetaDescription)
      
      setShowOptimizedMetaTitle(true)
      setShowOptimizedMetaDescription(true)

      setLoadingOptimizedMetaData(false)
    } catch (error) {
      setLoadingOptimizedMetaData(false)
    }
  },[keywords, productData])

  const handleChoseOptimizedMetaTitle = useCallback(() => {
    setMetaTitle(optimizedMetaTitle)
    setShowOptimizedMetaTitle(false)
  },[optimizedMetaTitle])

  const handleChoseOptimizedMetaDescription = useCallback(() => {
    setMetaDescription(optimizedMetaDescription)
    setShowOptimizedMetaDescription(false)
  },[optimizedMetaDescription])

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
                    value={metaTitle}
                    onChange={handleOnChangeMetaTitle}
                    label="Meta Title"
                    type="text"
                    maxLength={70}
                    autoComplete="meta title"
                    showCharacterCount
                  />
                  
                  <div style={{ color: 'var(--p-color-text-magic-secondary)' }}>
                    {loadingOptimizedMetaData ? 
                      <Spinner accessibilityLabel="Loading optimized meta data" size="small" />
                    :
                      <>
                      {showOptimizedMetaTitle ? 
                        <InlineStack gap='200' align='start'>
                          <div style={{width: 20, height:20}}>
                            <Icon
                            source={MagicIcon}
                            />
                          </div>
                          
                          <div onClick={handleChoseOptimizedMetaTitle} style={{cursor: 'pointer'}}>
                            <Text as='p'> 
                              {optimizedMetaTitle}
                            </Text>
                          </div>
                        </InlineStack>
                      :
                      null
                      }
                      </>
                    }
                  </div>
                </Box>
                <Box >
                  <TextField
                    value={metaDescription}
                    onChange={handleOnChangeMetaDescription}
                    label="Meta Description"
                    type="text"
                    maxLength={165}
                    multiline={3}
                    autoComplete="meta description"
                    showCharacterCount
                  />

                  <div style={{ color: 'var(--p-color-text-magic-secondary)' }}>
                    {loadingOptimizedMetaData ? 
                      <Spinner accessibilityLabel="Loading optimized meta data" size="small" />
                    :
                      <>
                      {showOptimizedMetaDescription ?
                        <InlineStack gap='200' align='start'>
                          <div style={{width: 20, height:20}}>
                            <Icon
                            source={MagicIcon}
                            />
                          </div>

                          <div onClick={handleChoseOptimizedMetaDescription} style={{width: '92%', cursor: 'pointer'}}>
                            <Text as='p'> 
                              {optimizedMetaDescription}
                            </Text>
                          </div>
                        </InlineStack>
                      :
                        null
                      }
                      </>
                    }
                  </div>
                </Box>

                <BlockStack gap='200'>
                  <InlineStack blockAlign='end' align='space-between'>
                    <div style={{ width: '85%' }}>
                      <TextField
                        value={keyWordInput}
                        onChange={handleOnChangeKeyWordInput}
                        label="Provide keywords for our AI"
                        type="text"
                        placeholder="e.g. organic cotton, eco-friendly, summer collection"
                        autoComplete="Provide keywords for our AI"
                        requiredIndicator
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
                    <div style={{ color: 'var(--p-color-text-magic-secondary)' }}>
                      <Icon
                        source={MagicIcon}
                      />
                    </div>
                    {suggestedKeyWords.map((keyWord, index) => (
                      <div key={index} style={{ color: 'var(--p-color-bg-fill-magic-secondary)' }}>
                        <Tag >
                          <div style={{ color: 'var(--p-color-text-magic-secondary)' }}>
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
              <BlockStack gap='100'>
                <Text as='h3'>
                  Google Search Preview
                </Text>
                <div style={{ width: '85%' }}>
                  <Card padding={{ xs: '100', sm: '200' }}>
                    <InlineStack align='space-between'>
                      <div style={{ width: '80%' }}>
                        <BlockStack >
                          <div style={{ width: '85%' }}>
                            <InlineStack align='space-between'>
                              <div style={{ width: '92%' }}>
                                <Text as='span' truncate >
                                  https://storename.com {'>'} products {'>'} {productData.title.toLowerCase().replace(/\s+/g, '-')}
                                </Text>
                              </div>

                              <Icon
                                source={MenuVerticalIcon}
                                tone="base"
                              />
                            </InlineStack>
                          </div>

                          <div style={{ color: 'var(--p-color-text-link)' }}>
                            <Text as='h3' variant="headingLg" fontWeight='regular'>
                              {metaTitle}
                            </Text>
                          </div>

                          <Text as='p' variant='bodyLg' breakWord>
                            {metaDescription}
                          </Text>
                        </BlockStack>
                      </div>

                      <div style={{ height: 80, width: 80  }}>
                        <Thumbnail
                          source={productData.productImage || '/assets/imgs/placeholder.png'}
                          size="large"
                          alt={`${productData.title} Image`}
                        />
                      </div>
                    </InlineStack>
                  </Card>
                </div>
              </BlockStack>

              <Box paddingBlockStart='300'>
                <BlockStack gap='100'>
                  <Text as='h3'>
                    AI Search Preview
                  </Text>
                  <div style={{ width: 140 }}>
                    
                    <Card padding={{ xs: '0', sm: '0' }}>
                      <Image src={`${productData.productImage}`} width={140} height={140} alt='ai image' />
                    
                      <Box padding={{ xs: '200', sm: '300' }} paddingBlockStart='0'>
                        <Text as='h3' variant="headingMd" fontWeight='semibold' breakWord>
                          {productData.title}
                        </Text>
                        <Box paddingBlockStart='200'>
                          <BlockStack gap='100'>
                            <Text as='p' variant='bodyLg' fontWeight='semibold' breakWord>
                              ${productData.productPrice}
                            </Text>

                            <Text as='p' variant='bodyMd' breakWord>
                              And 3 others
                            </Text>
                          </BlockStack>
                        </Box>
                      </Box>
                    </Card>
                  </div>
                </BlockStack>
              </Box>
            </Card>
          </Box>
        </Layout.Section>
        <Layout.Section variant="oneThird">
          <Card  >
            <BlockStack gap='100'>
              <InlineStack gap='200' wrap={false}>
                <Image src='/assets/imgs/ia.png' width={40} height={40} alt='ai image' />
                <BlockStack>
                  <div style={{ color: 'var(--p-color-text-magic-secondary)' }}>
                    <Text as='h2' variant="headingLg" fontWeight='medium'>AI Meta title/description optimizer</Text>
                  </div>
                  <Text as='p'>
                    Optimize your meta titles and meta descriptions with the power of AI
                  </Text>
                </BlockStack>
              </InlineStack>
              <Box paddingBlockStart='100'>
                <Button onClick={handleFetchOptimizedMetaData} fullWidth variant='primary' icon={MagicIcon} size='medium'>
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
