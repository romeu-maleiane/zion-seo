import { BlockStack, Box, Text, Button, Card, Form, FormLayout, InlineStack, Layout, Page, TextField, Thumbnail, Icon, Divider, Spinner } from '@shopify/polaris'
import {
  MagicIcon,
} from '@shopify/polaris-icons';
import "../../styles/customStyle.css";
import { GraphqlQueryError } from "@shopify/shopify-api";
import type { LoaderFunctionArgs, } from "@remix-run/node";
import { authenticateAdminShop } from "app/utils/authenticatedShop.server";
import prisma from "app/db.server";
import { useLoaderData, useNavigation } from "@remix-run/react";
import { useCallback, useEffect, useState } from 'react';
import { suggestKeywords } from 'app/utils/suggestKeywords.server';
import { fetchOptimizedMetaData } from 'app/utils/fetchOptimizedMetData.client';
import PreviewInput from 'app/Components/previewInput';
import KeywordInput from 'app/Components/keywordInput';
import KeywordSuggestionBlock from 'app/Components/KeywordSuggestionBlock';
import { updateAiCredits } from 'app/utils/updateaicredits.client';
import { postUpdateMetaData } from 'app/utils/postUpdateMetaData.client';
import SaveBarComponent from 'app/Components/saveBar';
import Footer from 'app/Components/footer.component';
import AiFeature from 'app/Components/aiFeature';
import SkeletonTablePage from 'app/Components/skeletonTablePage';


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
  aiCredits: number | null;
  suggestedKeywordsFromData: string[]
}

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { id } = params
  const completProductId = ('gid://shopify/Product/').concat('', id || '')
  const { admin } = await authenticateAdminShop(request);

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

    if (!productData) return Response.json({ message: 'Product not found' }, { status: 404 })

    const keywordsData = await suggestKeywords({ productTitle: productData?.title || '' })

    if (keywordsData.status === 'error') throw new Error("Error fetching suggested keywords");

    const storeBalance = await prisma.store.findUnique({
      where: { storeId: shopData.data.shop.id },
      select: {
        aiCredits: true,
      },
    })


    return Response.json({
      productData,
      shopId: shopData.data.shop.id,
      aiCredits: storeBalance?.aiCredits,
      suggestedKeywordsFromData: keywordsData.suggestedKeywords || []
    }, { status: 200 })
  } catch (error) {
    if (error instanceof GraphqlQueryError) {
      console.error('Meta Data Optimizer Graphql Error: ', error.body?.errors)
      return Response.json({ message: "Something went wroang loading data" }, { status: 500 });
    }
    console.error('Meta Data Optimizer Loader Error: ', error)
    return Response.json({ message: "Something went wroang loading data" }, { status: 500 });
  }
}


function OptimizeMetaDataPage() {
  const data: Data = useLoaderData()
  const [metaTitle, setMetaTitle] = useState<string>('')
  const [metaDescription, setMetaDescription] = useState<string>('')
  const [originalMetaTitle, setOriginalMetaTitle] = useState<string>('')
  const [originalMetaDescription, setOriginalMetaDescription] = useState<string>('')
  const [optimizedMetaTitle, setOptimizedMetaTitle] = useState<string>('')
  const [optimizedMetaDescription, setOptimizedMetaDescription] = useState<string>('')
  const [showOptimizedMetaTitle, setShowOptimizedMetaTitle] = useState<boolean>(false)
  const [showOptimizedMetaDescription, setShowOptimizedMetaDescription] = useState<boolean>(false)
  const [keyWordInputValue, setKeyWordInputValue] = useState<string>('')
  const [keyWords, setKeyWords] = useState<Array<string>>([])
  const [suggestedKeyWords, setSuggestedKeyWords] = useState<Array<string>>([])
  const [isMissingKeywords, setIsMissingKeywords] = useState<boolean>(false)
  const [credits, setCredits] = useState<number>(0)
  const navigation = useNavigation()
  const isLoading = navigation.state === 'loading'
  const [loadingOptimizedMetaData, setLoadingOptimizedMetaData] = useState<boolean>(false)
  const [loadingUpdateProductMetaData, setLoadingUpdateProductMetaData] = useState<boolean>(false)
  const { productData, aiCredits, suggestedKeywordsFromData } = data


  useEffect(() => {
    setMetaTitle(productData?.currentMetaTitle || '')
    setMetaDescription(productData?.currentMetaDescription || '')
    setSuggestedKeyWords(suggestedKeywordsFromData)
    setCredits(aiCredits || 0)

    setOriginalMetaTitle(productData?.currentMetaTitle || '')
    setOriginalMetaDescription(productData?.currentMetaDescription || '')
  }, [aiCredits, productData?.currentMetaDescription, productData?.currentMetaTitle, suggestedKeywordsFromData])

  const handleOnChangeMetaTitle = useCallback((value: string) => setMetaTitle(value), [])
  const handleOnChangeMetaDescription = useCallback((value: string) => setMetaDescription(value), [])
  const handleOnChangeKeyWordInputValue = useCallback((value: string) => {
    setKeyWordInputValue(value)
    setIsMissingKeywords(false)
  }, [])

  const handleAddKeyWord = useCallback(() => {
    const arrayOfKeyWords = keyWordInputValue.split(',')
      .map(keyword => keyword.trim())
      .filter(keyword => keyword.length > 0)

    setKeyWordInputValue('')

    setKeyWords(prev => {
      const newKeyWords = new Set([...prev, ...arrayOfKeyWords])
      return [...newKeyWords]
    })

  }, [keyWordInputValue])

  const handleRemoveKeyWord = useCallback((index: number) => {
    setKeyWords(prev => prev.filter((_, i) => i !== index))
  }, [])

  const handleAddSuggestedKeyWord = useCallback((index: number) => {
    setKeyWords(prev => {
      const newKeyWords = new Set([...prev, suggestedKeyWords[index]])
      return [...newKeyWords]
    })

    setSuggestedKeyWords(prev => prev.filter((_, i) => i !== index))
    setIsMissingKeywords(false)
  }, [suggestedKeyWords])

  const handleFetchOptimizedMetaData = useCallback(async () => {
    try {
      const costPerUsage = 8
      if (credits - costPerUsage < 0) return shopify.toast.show('Insufficient credits!',
        { duration: 5000, isError: true }
      );


      if (keyWords.length === 0) {
        setIsMissingKeywords(true)
        return shopify.toast.show('Keywords required!',
          { duration: 5000, isError: true }
        )
      }

      setLoadingOptimizedMetaData(true)

      const stringOfKeywords = keyWords.join(`, `)

      const optimizedMetaData = await fetchOptimizedMetaData({ productTitle: productData.title, keywords: stringOfKeywords, metaTitle: productData.currentMetaTitle, metaDescription: productData.currentMetaDescription, })

      if (!optimizedMetaData) throw new Error("An error occured fetching optimized meta data");

      const newAiCredits = await updateAiCredits({ creditsToBeSubtracted: costPerUsage })
      if (!newAiCredits) throw new Error("An error occured updating aiCredits");

      setOptimizedMetaTitle(optimizedMetaData.optimizedMetaTitle)
      setOptimizedMetaDescription(optimizedMetaData.optimizedMetaDescription)
      setCredits(newAiCredits?.aiCredits || 0)

      setShowOptimizedMetaTitle(true)
      setShowOptimizedMetaDescription(true)

      setLoadingOptimizedMetaData(false)
    } catch (error) {
      console.error('handle fetch optimized metaData error: ', error)
      setLoadingOptimizedMetaData(false)
      shopify.toast.show('Server Error!', { duration: 5000, isError: true })
    }
  }, [credits, keyWords, productData.currentMetaDescription, productData.currentMetaTitle, productData.title])

  const handleChoseOptimizedMetaTitle = useCallback(() => {
    setMetaTitle(optimizedMetaTitle)
    setShowOptimizedMetaTitle(false)
  }, [optimizedMetaTitle])

  const handleChoseOptimizedMetaDescription = useCallback(() => {
    setMetaDescription(optimizedMetaDescription)
    setShowOptimizedMetaDescription(false)
  }, [optimizedMetaDescription])

  const handleUpdateProduct = useCallback(async () => {
    try {
      setLoadingUpdateProductMetaData(true)

      const newMetaData = await postUpdateMetaData({ productId: productData.productId, newMetaTitle: metaTitle, newMetaDescription: metaDescription })

      if (!newMetaData) throw new Error("An error occured posting new meta data");

      setOriginalMetaTitle(newMetaData.currentMetaTitle)
      setOriginalMetaDescription(newMetaData.currentMetaDescription)

      shopify.toast.show('Product updated!')

      setLoadingUpdateProductMetaData(false)
    } catch (error) {
      setLoadingUpdateProductMetaData(false)
      shopify.toast.show('Server Error!', { isError: true })
      console.error('Handle Update Product Error: ', error)
    }
  }, [metaDescription, metaTitle, productData.productId])

  return isLoading ? (
    <SkeletonTablePage />
  ) : (
    <Page
      title={`${productData.title}`}
      backAction={{ content: 'Meta data optimizer', url: '/app/meta-data-optimizer' }}
    >

      <SaveBarComponent
        onSave={handleUpdateProduct}
        resetMetaTitle={setMetaTitle}
        resetMetaDescription={setMetaDescription}
        originalMetaTitle={originalMetaTitle}
        originalMetaDescription={originalMetaDescription}
        newMetaTitle={metaTitle}
        newMetaDescription={metaDescription}
      />

      <Layout>
        <Layout.Section>
          <Card>
            <Box paddingBlockEnd='300'>
              <Text as='h2' variant="headingLg" fontWeight='medium'>Optimize SEO</Text>
              <Box paddingBlockStart='100'>
                <Divider />
              </Box>
            </Box>

            <Form onSubmit={handleUpdateProduct}>
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
                    autoComplete="off"
                    showCharacterCount
                  />

                  <div style={{ color: 'var(--p-color-text-magic-secondary)' }}>
                    {loadingOptimizedMetaData ?
                      <Spinner accessibilityLabel="Loading optimized meta data" size="small" />
                      :
                      <>
                        {showOptimizedMetaTitle ?
                          <InlineStack gap='200' align='start'>
                            <div style={{ width: 20, height: 20 }}>
                              <Icon
                                source={MagicIcon}
                              />
                            </div>

                            <div onClick={handleChoseOptimizedMetaTitle} style={{ cursor: 'pointer' }}>
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
                    autoComplete="off"
                    showCharacterCount
                  />

                  <div style={{ color: 'var(--p-color-text-magic-secondary)' }}>
                    {loadingOptimizedMetaData ?
                      <Spinner accessibilityLabel="Loading optimized meta data" size="small" />
                      :
                      <>
                        {showOptimizedMetaDescription ?
                          <InlineStack gap='200' align='start'>
                            <div style={{ width: 20, height: 20 }}>
                              <Icon
                                source={MagicIcon}
                              />
                            </div>

                            <div onClick={handleChoseOptimizedMetaDescription} style={{ width: '92%', cursor: 'pointer' }}>
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

                <KeywordInput
                  keyWordInputValue={keyWordInputValue}
                  keyWords={keyWords}
                  handleOnChangeKeyWordInputValue={handleOnChangeKeyWordInputValue}
                  handleAddKeyWord={handleAddKeyWord}
                  handleRemoveKeyWord={handleRemoveKeyWord}
                  handleError={isMissingKeywords}
                  isRequired={true}
                />

                <KeywordSuggestionBlock
                  suggestedKeyWords={suggestedKeyWords}
                  handleAddSuggestedKeyWord={handleAddSuggestedKeyWord}
                />

                <InlineStack align='end'>
                  <Button loading={loadingUpdateProductMetaData} size="large" submit>Post</Button>
                </InlineStack>
              </FormLayout>
            </Form>
          </Card>

          <PreviewInput productTitle={productData.title} productImage={productData.productImage || ''} productPrice={productData.productPrice || '10.00'} metaTitle={metaTitle} metaDescription={metaDescription} />

        </Layout.Section>
        <Layout.Section variant="oneThird">

          <AiFeature
            title='AI Meta title/description optimizer'
            subTitle='Optimize your meta titles and meta descriptions with the power of AI'
            action={handleFetchOptimizedMetaData}
            loading={loadingOptimizedMetaData}
            aiCredits={credits}
          />

        </Layout.Section>
      </Layout>

      <Footer />
    </Page>
  )
}

export default OptimizeMetaDataPage
