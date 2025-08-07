import { BlockStack, Box, Text, Button, Card, Form, FormLayout, InlineStack, Layout, Page, TextField, Thumbnail, Icon, Divider, Tag, Spinner } from '@shopify/polaris'
import {
  XCircleIcon,
} from '@shopify/polaris-icons';
import "../styles/customStyle.css";
import { GraphqlQueryError } from "@shopify/shopify-api";
import type { LoaderFunctionArgs, } from "@remix-run/node";
import { authenticate } from "app/shopify.server";
import prisma from "app/db.server";
import { useLoaderData, useNavigation, } from "@remix-run/react";
import { useCallback, useEffect, useState, } from 'react';
import { suggestKeywords } from 'app/utils/suggestKeywords.server';
import { fetchGeneratedDescriptions } from 'app/utils/fetchGeneratedDescriptions.client';
import KeywordInput from 'app/Components/keywordInput';
import KeywordSuggestionBlock from 'app/Components/KeywordSuggestionBlock';
import { updateAiCredits } from 'app/utils/updateaicredits.client';
import { postUpdateProductDescription } from 'app/utils/postUpdateDescription.client';
import Footer from 'app/Components/footer.component';
import AiFeature from 'app/Components/aiFeature';
import Editor from 'app/Components/editor.client';
import { ClientOnly } from "remix-utils/client-only"
import CustomBadge from 'app/Components/customBadge';
import SkeletonTablePage from 'app/Components/skeletonTablePage';

type Data = {
  productData: {
    productId: string;
    productImage: string | null;
    title: string;
    currentDescription: string;
    createdAt: Date | string;
  }
  shopId: string;
  aiCredits: number | null;
  suggestedKeywordsFromData: string[]
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
        title: true,
        currentDescription: true,
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
      console.error('Descripton Generator Graphql Error: ', error.body?.errors)
      return Response.json({ message: "Something went wroang loading data" }, { status: 500 });
    }
    console.error('Descripton Generator Loader Error: ', error)
    return Response.json({ message: "Something went wroang loading data" }, { status: 500 });
  }
}


function OptimizeProductDescriptionPage() {
  const data: Data = useLoaderData()
  const [description, setDescription] = useState<string>('')
  const [brand, setBrand] = useState<string>('')
  const [productDetailInputValue, setProductDetailInputValue] = useState<string>('')
  const [productDetails, setProductDetails] = useState<Array<string>>([])
  const [keyWordInputValue, setKeyWordInputValue] = useState<string>('')
  const [keyWords, setKeyWords] = useState<Array<string>>([])
  const [suggestedKeyWords, setSuggestedKeyWords] = useState<Array<string>>([])
  const [isMissingBrand, setIsMissingBrand] = useState<boolean>(false)
  const [isMissingProductDetails, setIsMissingProductDetails] = useState<boolean>(false)
  const [credits, setCredits] = useState<number>(0)
  const navigation = useNavigation()
  const isLoading = navigation.state === 'loading'
  const [loadingFetchGeneratedDescriptions, setLoadingFetchGeneratedDescriptions] = useState<boolean>(false)
  const [loadingUpdateProductDescription, setLoadingUpdateProductDescription] = useState<boolean>(false)
  const { shopId, productData, aiCredits, suggestedKeywordsFromData } = data

  const [descriptions, setDescriptions] = useState([
    {
      label: 'Your original description',
      value: '',
      show: true,
      type: 'original'
    },
    {
      label: 'Creative 1',
      value: '',
      show: false,
      type: 'creative1'
    },
    {
      label: 'Creative 2',
      value: '',
      show: false,
      type: 'creative2'
    },
  ])

  const [selectedDescription, setSelectedDescription] = useState<string>('original')


  useEffect(() => setDescriptions(prev => prev.map(desc =>
    desc.type === 'original' ?
      { ...desc, value: productData.currentDescription }
      : desc
  )), [productData.currentDescription])

  useEffect(() => {
    setDescription(productData?.currentDescription || '')
    setSuggestedKeyWords(suggestedKeywordsFromData)
    setCredits(aiCredits || 0)
  }, [aiCredits, productData?.currentDescription, suggestedKeywordsFromData])

  const handleOnChangeBrand = useCallback((value: string) => {
    setBrand(value)
    setIsMissingBrand(false)
  }, [])
  const handleOnChangeProductDetailInputValue = useCallback((value: string) => {
    setProductDetailInputValue(value)
    setIsMissingProductDetails(false)
  }, [])
  const handleOnChangeKeyWordInputValue = useCallback((value: string) => {
    setKeyWordInputValue(value)
  }, [])

  const handleAddProductDetails = useCallback(() => {
    const arrayOfProductDetails = productDetailInputValue.split(',')
      .map(productDetail => productDetail.trim())
      .filter(productDetail => productDetail.length > 0)

    setProductDetailInputValue('')
    setIsMissingProductDetails(false)

    setProductDetails(prev => {
      const newProductDetails = new Set([...prev, ...arrayOfProductDetails])
      return [...newProductDetails]
    })

  }, [productDetailInputValue])

  const handleRemoveProductDetail = useCallback((index: number) => {
    setProductDetails(prev => prev.filter((_, i) => i !== index))
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
  }, [suggestedKeyWords])

  const handleSetSelectedDescription = useCallback((type: string) => {
    setSelectedDescription(type)
    descriptions.map(desc => {
      if (desc.type === type) setDescription(desc.value)
      return desc
    })
    console.log('clicked')
  }, [descriptions,])

  const handleEditDescription = useCallback((type: string, newValue: string) => {
    setDescriptions(prev => prev.map(desc => desc.type === type ? { ...desc, value: newValue } : desc))
    if (type === selectedDescription) setDescription(newValue)
  }, [selectedDescription])

  const handleAddCreativeDescriptions = useCallback(({ creative1, creative2 }: { creative1: string, creative2: string }) => {
    setDescriptions(prev => prev.map(desc =>
      desc.type === 'creative1'
        ? { ...desc, value: creative1, show: true }
        : desc.type === 'creative2'
          ? { ...desc, value: creative2, show: true }
          : desc
    ))
  }, [])

  const handleFetchGeneratedDescriptions = useCallback(async () => {
    try {
      const costPerUsage = 10
      if (credits - costPerUsage < 0) return shopify.toast.show('Insufficient credits!',
        { duration: 5000, isError: true }
      );

      if (brand.length === 0) {
        setIsMissingBrand(true)
        return shopify.toast.show('Brand required!',
          { duration: 5000, isError: true }
        )
      }

      if (productDetails.length === 0) {
        setIsMissingProductDetails(true)
        return shopify.toast.show('Product details required!',
          { duration: 5000, isError: true }
        )
      }

      setLoadingFetchGeneratedDescriptions(true)

      const stringOfProductDetails = keyWords.join(`, `)
      const stringOfKeywords = keyWords ? keyWords.join(`, `) : ''

      const generatedDescriptions = await fetchGeneratedDescriptions({ productTitle: productData.title, brandName: brand, productDetails: stringOfProductDetails, keywords: stringOfKeywords, })

      if (!generatedDescriptions) throw new Error("An error occured fetching generated descriptions");

      const newAiCredits = await updateAiCredits({ shopId, aiCredits: credits || 0, creditsToBeSubtracted: costPerUsage })
      if (!newAiCredits) throw new Error("An error occured updating aiCredits");

      handleAddCreativeDescriptions({ creative1: generatedDescriptions.descriptionOne, creative2: generatedDescriptions.descriptionTwo })
      setCredits(newAiCredits?.aiCredits || 0)


      setLoadingFetchGeneratedDescriptions(false)
    } catch (error) {
      console.error('handle fetch generated descriptions error: ', error)
      setLoadingFetchGeneratedDescriptions(false)
      shopify.toast.show('Server Error!', { duration: 5000, isError: true })
    }
  }, [brand, credits, handleAddCreativeDescriptions, keyWords, productData.title, productDetails, shopId])


  const handleUpdateProduct = useCallback(async () => {
    try {

      if (!description) {
        return shopify.toast.show('Product description required!',
          { duration: 5000, isError: true }
        )
      }

      setLoadingUpdateProductDescription(true)

      const newDescription = await postUpdateProductDescription({ productId: productData.productId, newProductDescription: description })

      if (!newDescription) throw new Error("An error occured posting new generated descriptions");

      shopify.toast.show('Product updated!')

      setLoadingUpdateProductDescription(false)
    } catch (error) {
      setLoadingUpdateProductDescription(false)
      shopify.toast.show('Server Error!', { isError: true })
      console.error('Handle Update Product Error: ', error)
    }
  }, [description, productData.productId])


  return isLoading ? (
    <SkeletonTablePage />
  ) : (
    <Page
      title={`${productData.title}`}
      backAction={{ content: 'Description generator', url: '/app/description-generator' }}
    >

      <Layout>
        <Layout.Section>
          <Card>
            <Box paddingBlockEnd='300'>
              <Text as='h2' variant="headingLg" fontWeight='medium'>Generate Description</Text>
              <Box paddingBlockStart='100'>
                <Divider />
              </Box>
            </Box>

            <Form preventDefault implicitSubmit={false} onSubmit={() => { }}>
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
                    value={brand}
                    onChange={handleOnChangeBrand}
                    label="Brand"
                    type="text"
                    autoComplete="off"
                    error={isMissingBrand}
                    requiredIndicator
                  />
                </Box>

                <BlockStack gap='200'>
                  <InlineStack blockAlign='end' align='space-between'>
                    <div style={{ width: '85%' }}>
                      <TextField
                        value={productDetailInputValue}
                        onChange={handleOnChangeProductDetailInputValue}
                        label="Product details"
                        type="text"
                        placeholder="e.g. lightweight, waterproof, breathable, stretch fabric"
                        autoComplete="off"
                        error={isMissingProductDetails}
                        requiredIndicator
                      />
                    </div>
                    <div style={{ width: '13%' }}>
                      <Button onClick={handleAddProductDetails} fullWidth size="large">Add</Button>
                    </div>
                  </InlineStack>
                  {productDetails &&
                    <Box>
                      <InlineStack gap='200' align='start'>
                        {productDetails.map((productDetail, index) => (
                          <Tag key={index}>
                            <InlineStack gap='100'>
                              <span>{productDetail}</span>
                              <span onClick={() => handleRemoveProductDetail(index)}><Icon source={XCircleIcon} /></span>
                            </InlineStack>
                          </Tag>
                        ))}
                      </InlineStack>
                    </Box>
                  }
                </BlockStack>

                <KeywordInput
                  keyWordInputValue={keyWordInputValue}
                  keyWords={keyWords}
                  handleOnChangeKeyWordInputValue={handleOnChangeKeyWordInputValue}
                  handleAddKeyWord={handleAddKeyWord}
                  handleRemoveKeyWord={handleRemoveKeyWord}
                />

                <KeywordSuggestionBlock
                  suggestedKeyWords={suggestedKeyWords}
                  handleAddSuggestedKeyWord={handleAddSuggestedKeyWord}
                />

                <InlineStack align='end'>
                  <Button loading={loadingUpdateProductDescription} size="large" onClick={handleUpdateProduct}>Post</Button>
                </InlineStack>
              </FormLayout>
            </Form>
          </Card>

          <Box paddingBlockStart='300'>
            <Card>
              <Box paddingBlockEnd='300'>
                <Text as='h2' variant="headingLg" fontWeight='medium'>Product Descriptions</Text>
                <Box paddingBlockStart='100'>
                  <Divider />
                </Box>
              </Box>

              <BlockStack gap='300'>
                {descriptions.map((desc, index) =>
                  desc.type === 'original' ?
                    <BlockStack key={index} gap='100'>
                      <InlineStack gap='200'>
                        <Text as='span'>Your original description</Text>

                        {selectedDescription === desc.type ?
                          <CustomBadge onClick={() => handleSetSelectedDescription(desc.type)} text='Selected' tone='success' />
                          :
                          <CustomBadge onClick={() => handleSetSelectedDescription(desc.type)} text='Select' tone='base' />
                        }

                      </InlineStack>

                      <ClientOnly fallback={false}>
                        {() => <Editor type={desc.type} content={`${desc.value}`} handleEditValue={handleEditDescription} />}
                      </ClientOnly>
                    </BlockStack>
                    :
                    <>
                      {desc.show ?

                        <BlockStack key={index} gap='100'>
                          <InlineStack gap='200'>
                            <div style={{ color: 'var(--p-color-text-magic-secondary)' }}>
                              <Text as='span'>{desc.label}</Text>
                            </div>

                            {selectedDescription === desc.type ?
                              <CustomBadge onClick={() => handleSetSelectedDescription(desc.type)} text='Selected' tone='magic' />
                              :
                              <CustomBadge onClick={() => handleSetSelectedDescription(desc.type)} text='Select' tone='magic' />
                            }

                            {loadingFetchGeneratedDescriptions ? <Spinner accessibilityLabel="Loading generate description" size="small" /> : null}
                          </InlineStack>

                          <ClientOnly fallback={false}>
                            {() => <Editor type={desc.type} content={`${desc.value}`} handleEditValue={handleEditDescription} />}
                          </ClientOnly>
                        </BlockStack>
                        :
                        null
                      }
                    </>
                )}
              </BlockStack>
            </Card>
          </Box>
        </Layout.Section>

        <Layout.Section variant="oneThird">

          <AiFeature
            title='AI Product Descriptions Generator'
            subTitle='Generate optimized product discriptions with the power of AI'
            action={handleFetchGeneratedDescriptions}
            loading={loadingFetchGeneratedDescriptions}
            aiCredits={credits}
          />

        </Layout.Section>
      </Layout>

      <Footer />
    </Page>
  )
}

export default OptimizeProductDescriptionPage
