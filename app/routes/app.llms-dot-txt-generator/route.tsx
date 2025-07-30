import type { LoaderFunctionArgs } from '@remix-run/node'
import { BlockStack, Card, Text, Layout, Page, Box, Checkbox, Divider, RadioButton, Button, TextField } from '@shopify/polaris'
import Footer from 'app/Components/footer.component'
import { SelectedProductsModal } from 'app/Components/selectedProductsModal'
import { useCallback, useEffect, useState } from 'react'
import prisma from "app/db.server";
import { authenticate } from 'app/shopify.server'
import { useLoaderData, useNavigation } from '@remix-run/react'
import ExceptProductsModal from 'app/Components/exceptSelectedProductsModal'
import SkeletonTablePage from 'app/Components/skeletonTablePage'
import ExceptSelectedCollectionsModal from 'app/Components/exceptSelectedCollections'
import SelectedCollectionsModal from 'app/Components/selectedCollectionsModal'

type LoaderLlmsDotTxtData = {
    productsData: {
        productId: string;
        productImage: string | null;
        title: string;
        showForLlms: boolean;
    }[]
    collectionsData: {
        title: string;
        showForLlms: boolean;
        collectionId: string;
        collectionImage: string | null;
    }[]
    LLMDotTxtConfigData: {
        llmDotTxtDescription: string
        includeProducts: boolean
        includeCollections: boolean
        includeBlogs: boolean
        includePages: boolean
        selectAllProducts: boolean
        selectProducts: boolean
        removeProducts: boolean
        selectAllCollections: boolean
        selectCollections: boolean
        removeCollections: boolean
        selectChatGPT: boolean
        selectGemini: boolean
        selectGrok: boolean
        selectDeepSeek: boolean
        selectClaude: boolean
        selectPerplexity: boolean
    }
    shopId: string
}

type ProductType = {
    productId: string;
    productImage: string | null;
    title: string;
    showForLlms: boolean;
}

type CollectionType = {
    title: string;
    showForLlms: boolean;
    collectionId: string;
    collectionImage: string | null;
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
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

        const shopId: string = shopData.data.shop.id

        const [productsData, collectionsData, LLMDotTxtConfigData] = await Promise.all([
            prisma.product.findMany({
                take: 15,
                where: { storeId: shopId },
                select: {
                    productId: true,
                    productImage: true,
                    title: true,
                    showForLlms: true,
                }
            }),
            prisma.collection.findMany({
                where: { storeId: shopId },
                select: {
                    collectionId: true,
                    collectionImage: true,
                    title: true,
                    showForLlms: true,
                }
            }),
            async function () {
                const data = await prisma.lLMDotTxtConfig.findFirst({
                    where: { storeId: shopId },
                    select: {
                        llmDotTxtDescription: true,
                        includeProducts: true,
                        includeCollections: true,
                        includeBlogs: true,
                        includePages: true,
                        selectAllProducts: true,
                        selectProducts: true,
                        removeProducts: true,
                        selectAllCollections: true,
                        selectCollections: true,
                        removeCollections: true,
                        selectChatGPT: true,
                        selectGemini: true,
                        selectGrok: true,
                        selectDeepSeek: true,
                        selectClaude: true,
                        selectPerplexity: true
                    }
                })

                if (!data) {
                    return await prisma.lLMDotTxtConfig.create({
                        data: { storeId: shopId }
                    })
                }

                return data
            }()
        ])


        return Response.json({ productsData, collectionsData, LLMDotTxtConfigData, shopId }, { status: 200 })
    } catch (error) {
        console.error('LLMs.txt Loader Error : ', error)
        return Response.json({ message: 'Something went wroang loading data' }, { status: 500 })
    }
}


function LlmsDotTxtPage() {
    const data: LoaderLlmsDotTxtData = useLoaderData()
    const navigation = useNavigation()
    const isLoading = navigation.state === 'loading'
    const [description, setDescription] = useState<string>('')
    const [includeProductsStatus, setIncludeProductsStatus] = useState<boolean>(true)
    const [includeCollectionsStatus, setIncludeCollectionsStatus] = useState<boolean>(true)
    const [includeBlogsStatus, setIncludeBlogsStatus] = useState<boolean>(true)
    const [includePagesStatus, setIncludePagesStatus] = useState<boolean>(true)
    const [productsRadio, setProductsRadio] = useState<'all' | 'selected' | 'except'>('all');
    const [collectionsRadio, setCollectionsRadio] = useState<'all' | 'selected' | 'except'>('all');
    const [selectProductsOpen, setSelectProductsOpen] = useState(false);
    const [selectCollectionsOpen, setSelectCollectionsOpen] = useState(false);
    const [exceptProductsOpen, setExceptProductsOpen] = useState(false);
    const [exceptCollectionsOpen, setExceptCollectionsOpen] = useState(false);
    const [allProducts, setAllProducts] = useState<ProductType[]>([]);
    const [collections, setCollections] = useState<CollectionType[]>([]);
    const [savedSelectedProducts, setSavedSelectedProducts] = useState<string[]>([])
    const [savedSelectedCollections, setSavedSelectedCollections] = useState<string[]>([])
    const [savedExceptSelectedProducts, setSavedExceptSelectedProducts] = useState<string[]>([])
    const [savedExceptSelectedCollections, setSavedExceptSelectedCollections] = useState<string[]>([])
    const [crawlers, setCrawlers] = useState([
        {
            label: 'ChatGPT',
            id: 'chatgpt',
            status: true
        },
        {
            label: 'Gemini',
            id: 'gemini',
            status: true
        },
        {
            label: 'Grok',
            id: 'grok',
            status: true
        },
        {
            label: 'DeepSeek',
            id: 'deepseek',
            status: true
        },
        {
            label: 'Claude',
            id: 'claude',
            status: true
        },
        {
            label: 'Perplexity',
            id: 'perplexity',
            status: true
        },
    ])

    useEffect(() => {
        setDescription(data.LLMDotTxtConfigData.llmDotTxtDescription)
        setAllProducts(data.productsData)
        setCollections(data.collectionsData)
        setIncludeProductsStatus(data.LLMDotTxtConfigData.includeProducts)
        setIncludeCollectionsStatus(data.LLMDotTxtConfigData.includeCollections)
        setIncludeBlogsStatus(data.LLMDotTxtConfigData.includeBlogs)
        setIncludePagesStatus(data.LLMDotTxtConfigData.includePages)
        setProductsRadio(() => {
            if (data.LLMDotTxtConfigData.selectAllProducts) return 'all'
            else if (data.LLMDotTxtConfigData.selectProducts) return 'selected'
            else return 'except'
        })
        setCollectionsRadio(() => {
            if (data.LLMDotTxtConfigData.selectAllCollections) return 'all'
            else if (data.LLMDotTxtConfigData.selectCollections) return 'selected'
            else return 'except'
        })
        setCrawlers([
            {
                label: 'ChatGPT',
                id: 'chatgpt',
                status: data.LLMDotTxtConfigData.selectChatGPT
            },
            {
                label: 'Gemini',
                id: 'gemini',
                status: data.LLMDotTxtConfigData.selectGemini
            },
            {
                label: 'Grok',
                id: 'grok',
                status: data.LLMDotTxtConfigData.selectGrok
            },
            {
                label: 'DeepSeek',
                id: 'deepseek',
                status: data.LLMDotTxtConfigData.selectDeepSeek
            },
            {
                label: 'Claude',
                id: 'claude',
                status: data.LLMDotTxtConfigData.selectClaude
            },
            {
                label: 'Perplexity',
                id: 'perplexity',
                status: data.LLMDotTxtConfigData.selectPerplexity
            },
        ])
    }, [data,])

    const handleOnChangeDescription = useCallback((value: string) => setDescription(value), [])

    const handleOnChangeIncludeProducts = useCallback(() => setIncludeProductsStatus(prev => !prev), [])
    const handleOnChangeIncludeCollections = useCallback(() => setIncludeCollectionsStatus(prev => !prev), [])
    const handleOnChangeIncludeBlogs = useCallback(() => setIncludeBlogsStatus(prev => !prev), [])
    const handleOnChangeIncludePages = useCallback(() => setIncludePagesStatus(prev => !prev), [])

    const handleProductsRadioChange = useCallback((value: 'all' | 'selected' | 'except') => {
        setProductsRadio(value)
    }, []);

    const handleCollectionsRadioChange = useCallback((value: 'all' | 'selected' | 'except') => {
        setCollectionsRadio(value)
    }, []);

    const handleOnChageCrawlerStatus = useCallback((id: string) => {
        setCrawlers(prev => prev.map(crawler => crawler.id === id
            ? { ...crawler, status: !crawler.status }
            : crawler
        ))
    }, [])

    return isLoading ? (
        <SkeletonTablePage />
    ) : (
        <Page
            title='LLMs.txt Generator'
            subtitle='Generate Your LLMs.txt File in Seconds — Stay Visible to AI Crawlers'
            backAction={{ content: 'Dashboard', url: '/app' }}
            secondaryActions={<Button>View LLMs.txt</Button>}
            primaryAction={<Button variant="primary">save</Button>}
        >
            <Layout>
                <Layout.Section>
                    <Card>
                        <BlockStack gap='100'>
                            <Text as='h2' variant="headingLg" fontWeight='medium'>
                                Description (Optional)
                            </Text>
                            <Divider />
                        </BlockStack>

                        <Box paddingBlockStart='300'>
                            <TextField
                                label="Briefly describe your site or content focus."
                                value={description}
                                onChange={handleOnChangeDescription}
                                placeholder='Optional description'
                                multiline={3}
                                autoComplete="off"
                            />
                        </Box>
                    </Card>
                </Layout.Section>

                <Layout.Section>
                    <Card>
                        <BlockStack gap='100'>
                            <Text as='h2' variant="headingLg" fontWeight='medium'>
                                Content Selection
                            </Text>
                            <Divider />
                        </BlockStack>

                        <SelectedProductsModal
                            modalOpen={selectProductsOpen}
                            setModalOpen={setSelectProductsOpen}
                            products={allProducts}
                            shopId={data.shopId}
                            setNewProducts={setAllProducts}
                            savedSelectedProducts={savedSelectedProducts}
                            setSavedSelectedProducts={setSavedSelectedProducts}
                        />
                        <ExceptProductsModal
                            modalOpen={exceptProductsOpen}
                            setModalOpen={setExceptProductsOpen}
                            products={allProducts} shopId={data.shopId}
                            setNewProducts={setAllProducts}
                            savedExceptSelectedProducts={savedExceptSelectedProducts}
                            setSavedExceptSelectedProducts={setSavedExceptSelectedProducts}
                        />

                        <Box paddingBlock='300'>
                            <Box>
                                <Text as='p'>
                                    Choose which products, collections, blog posts, and pages to include in the file.
                                </Text>
                            </Box>

                            <BlockStack>

                                <Checkbox
                                    label={'Include Products'}
                                    checked={includeProductsStatus}
                                    onChange={handleOnChangeIncludeProducts}
                                />
                                {includeProductsStatus ?
                                    <Box paddingInlineStart='600'>
                                        <BlockStack>
                                            <RadioButton
                                                label='All products'
                                                checked={productsRadio === 'all'}
                                                onChange={() => handleProductsRadioChange('all')}
                                            />
                                            <RadioButton
                                                label='Selected products'
                                                checked={productsRadio === 'selected'}
                                                onChange={() => handleProductsRadioChange('selected')}
                                            />
                                            <RadioButton
                                                label='All products execept selected'
                                                checked={productsRadio === 'except'}
                                                onChange={() => handleProductsRadioChange('except')}
                                            />

                                            {productsRadio === 'selected' || productsRadio === 'except' ?
                                                <div style={{ width: '200px' }}>
                                                    <Box paddingBlockStart='100'>
                                                        <Button
                                                            onClick={productsRadio === 'selected' ?
                                                                () => setSelectProductsOpen(true)
                                                                : productsRadio === 'except'
                                                                    ? () => setExceptProductsOpen(true)
                                                                    : () => { setExceptProductsOpen(false); setSelectProductsOpen(false) }
                                                            }
                                                        >
                                                            {productsRadio === 'selected' && savedSelectedProducts.length > 0 || productsRadio === 'except' && savedExceptSelectedProducts.length > 0 ? `${productsRadio === 'selected' ? savedSelectedProducts.length : savedExceptSelectedProducts.length} Products Selected` : 'Select Products'}
                                                        </Button>
                                                    </Box>
                                                </div>
                                                :
                                                null
                                            }
                                        </BlockStack>
                                    </Box>
                                    : null
                                }
                            </BlockStack>
                        </Box>

                        <Divider />

                        <SelectedCollectionsModal
                            modalOpen={selectCollectionsOpen}
                            setModalOpen={setSelectCollectionsOpen}
                            collections={collections} shopId={data.shopId}
                            setNewCollections={setCollections}
                            savedSelectedCollections={savedSelectedCollections}
                            setSavedSelectedCollections={setSavedSelectedCollections}
                        />
                        <ExceptSelectedCollectionsModal
                            modalOpen={exceptCollectionsOpen}
                            setModalOpen={setExceptCollectionsOpen}
                            collections={collections} shopId={data.shopId}
                            setNewCollections={setCollections}
                            savedExceptSelectedCollections={savedExceptSelectedCollections}
                            setSavedExceptSelectedCollections={setSavedExceptSelectedCollections}
                        />

                        <Box paddingBlock='200'>
                            <BlockStack>
                                <Checkbox
                                    label={'Include Collections'}
                                    checked={includeCollectionsStatus}
                                    onChange={handleOnChangeIncludeCollections}
                                />

                                {includeCollectionsStatus ?
                                    <Box paddingInlineStart='600'>
                                        <BlockStack>
                                            <RadioButton
                                                label='All collections'
                                                checked={collectionsRadio === 'all'}
                                                onChange={() => handleCollectionsRadioChange('all')}
                                            />
                                            <RadioButton
                                                label='Selected collections'
                                                checked={collectionsRadio === 'selected'}
                                                onChange={() => handleCollectionsRadioChange('selected')}
                                            />
                                            <RadioButton
                                                label='All collections execept selected'
                                                checked={collectionsRadio === 'except'}
                                                onChange={() => handleCollectionsRadioChange('except')}
                                            />

                                            {collectionsRadio === 'selected' || collectionsRadio === 'except' ?
                                                <div style={{ width: '200px' }}>
                                                    <Box paddingBlockStart='100'>
                                                        <Button
                                                            onClick={collectionsRadio === 'selected' ?
                                                                () => setSelectCollectionsOpen(true)
                                                                : collectionsRadio === 'except'
                                                                    ? () => setExceptCollectionsOpen(true)
                                                                    : () => { setExceptCollectionsOpen(false); setSelectCollectionsOpen(false) }
                                                            }
                                                        >
                                                            {collectionsRadio === 'selected' && savedSelectedCollections.length > 0 || collectionsRadio === 'except' && savedExceptSelectedCollections.length > 0 ? `${collectionsRadio === 'selected' ? savedSelectedCollections.length : savedExceptSelectedCollections.length} Collections Selected` : 'Select Collections'}
                                                        </Button>
                                                    </Box>
                                                </div>
                                                :
                                                null
                                            }
                                        </BlockStack>
                                    </Box>
                                    : null
                                }
                            </BlockStack>
                        </Box>

                        <Divider />

                        <Box paddingBlock='200'>
                            <Checkbox
                                label={'Include Blogs'}
                                checked={includeBlogsStatus}
                                onChange={handleOnChangeIncludeBlogs}
                            />
                        </Box>

                        <Divider />

                        <Box paddingBlock='200'>
                            <Checkbox
                                label={'Include Pages'}
                                checked={includePagesStatus}
                                onChange={handleOnChangeIncludePages}
                            />
                        </Box>
                    </Card>
                </Layout.Section>

                <Layout.Section>
                    <Card>
                        <BlockStack gap='100'>
                            <Text as='h2' variant="headingLg" fontWeight='medium'>
                                Crawler Access
                            </Text>
                            <Divider />
                        </BlockStack>

                        <Box paddingBlockStart='300'>
                            <Box>
                                <Text as='p'>
                                    Select which LLM crawlers are allowed. All are enabled by default.
                                </Text>
                            </Box>
                            <BlockStack gap='200'>
                                {crawlers.map(crawler => (
                                    <Checkbox key={crawler.id}
                                        label={crawler.label}
                                        checked={crawler.status}
                                        onChange={() => handleOnChageCrawlerStatus(crawler.id)}
                                    />
                                ))}
                            </BlockStack>
                        </Box>
                    </Card>
                </Layout.Section>

                <Layout.Section>
                    <Footer />
                </Layout.Section>
            </Layout>
        </Page>
    )
}

export default LlmsDotTxtPage
