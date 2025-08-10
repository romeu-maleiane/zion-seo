import type { LoaderFunctionArgs } from '@remix-run/node'
import { BlockStack, Card, Text, Layout, Page, Box, Checkbox, Divider, RadioButton, Button, TextField } from '@shopify/polaris'
import Footer from 'app/Components/footer.component'
import { useCallback, useEffect, useState } from 'react'
import prisma from "app/db.server";
import { authenticate } from 'app/shopify.server'
import { useLoaderData, useNavigation } from '@remix-run/react'
import SkeletonTablePage from 'app/Components/skeletonTablePage'
import { fetchPostLlmsDotTxt } from 'app/utils/fetchPostLlmsDotTxt.client'
import { GENERATE_URL_REDIRECT_MUTATION, } from 'app/utils/graphqlQuerysAndMutations'
import { GraphqlQueryError } from "@shopify/shopify-api";
import { GenericResourceSelectionModal } from 'app/Components/genericModal'
import { handleFetchNextProductsForModal } from 'app/utils/handleFetchNextProductsForModal.client'
import { handleFetchNextCollectionsForModal } from 'app/utils/handleFetchNextCollectionsForModal.client'
import SaveBarComponentForLlmsDotTxt from 'app/Components/saveBarForLlmsDotTxt';

type LoaderLlmsDotTxtData = {
    productsData: {
        productId: string;
        productImage: string | null;
        title: string;
    }[]
    collectionsData: {
        title: string;
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
        selectedProducts: boolean
        exceptSelectedProducts: boolean
        selectAllCollections: boolean
        selectedCollections: boolean
        exceptSelectedCollections: boolean
        selectChatGPT: boolean
        selectGemini: boolean
        selectGrok: boolean
        selectDeepSeek: boolean
        selectClaude: boolean
        selectPerplexity: boolean
    }
    shopId: string
    shopDomain: string
}

type LlmsDotTxtConfigType = LoaderLlmsDotTxtData['LLMDotTxtConfigData']

type ResourceType = {
    id: string;
    image: string | null;
    title: string;
}


export const loader = async ({ request }: LoaderFunctionArgs) => {
    const { admin } = await authenticate.admin(request);

    try {
        const shop = await admin.graphql(
            `#graphql
                query shopInfo {
                    shop {
                        id
                        primaryDomain {
                            host
                        }
                    }
                }`,
        );

        const shopData = await shop.json()

        const shopId: string = shopData.data.shop.id
        const shopDomain: string = shopData.data.shop.primaryDomain.host

        const getOrCreateLlmsConfig = async (shopId: string) => {
            let config = await prisma.lLMDotTxtConfig.findFirst({
                where: { storeId: shopId },
                select: {
                    llmDotTxtDescription: true,
                    includeProducts: true,
                    includeCollections: true,
                    includeBlogs: true,
                    includePages: true,
                    selectAllProducts: true,
                    selectedProducts: true,
                    exceptSelectedProducts: true,
                    selectAllCollections: true,
                    selectedCollections: true,
                    exceptSelectedCollections: true,
                    selectChatGPT: true,
                    selectGemini: true,
                    selectGrok: true,
                    selectDeepSeek: true,
                    selectClaude: true,
                    selectPerplexity: true
                }
            }
            );
            if (!config) {
                const response = await admin.graphql(GENERATE_URL_REDIRECT_MUTATION, {
                    variables: {
                        urlRedirect: {
                            path: "/llms.txt",
                            target: "/a/llms-txt"
                        }
                    }
                });
                const urlRedirectData = await response.json()
                const urlRedirectId = urlRedirectData.data?.urlRedirectCreate?.urlRedirect.id || '';
                await prisma.store.updateMany({ where: { storeId: shopId }, data: { urlRedirectLlmsId: urlRedirectId } });
                config = await prisma.lLMDotTxtConfig.create({ data: { storeId: shopId } });
            }
            return config;
        };

        const [productsData, collectionsData, LLMDotTxtConfigData] = await Promise.all([
            prisma.product.findMany({
                take: 15,
                where: { storeId: shopId },
                select: {
                    productId: true,
                    productImage: true,
                    title: true,
                }
            }),
            prisma.collection.findMany({
                where: { storeId: shopId },
                select: {
                    collectionId: true,
                    collectionImage: true,
                    title: true,
                }
            }),
            getOrCreateLlmsConfig(shopId)
        ])


        return Response.json({ productsData, collectionsData, LLMDotTxtConfigData, shopId, shopDomain }, { status: 200 })
    } catch (error) {
        if (error instanceof GraphqlQueryError) {
            console.error('LLMs.txt Graphql Error: ', error.body?.errors)
            return Response.json({ message: "Something went wroang loading data" }, { status: 500 });
        }
        console.error('LLMs.txt Loader Error : ', error)
        return Response.json({ message: 'Something went wroang loading data' }, { status: 500 })
    }
}


function LlmsDotTxtPage() {
    const data: LoaderLlmsDotTxtData = useLoaderData()
    const navigation = useNavigation()
    const isLoading = navigation.state === 'loading'
    const [isPostingLlmsDotTxt, setIsPostingLlmsDotTxt] = useState<boolean>(false)
    const [originalLlmsDotTxtConfig, setOriginalLlmsDotTxtConfig] = useState<LlmsDotTxtConfigType>({
        llmDotTxtDescription: '',
        includeProducts: true,
        includeCollections: true,
        includeBlogs: true,
        includePages: true,
        selectAllProducts: true,
        selectedProducts: false,
        exceptSelectedProducts: false,
        selectAllCollections: true,
        selectedCollections: false,
        exceptSelectedCollections: false,
        selectChatGPT: true,
        selectGemini: true,
        selectGrok: true,
        selectDeepSeek: true,
        selectClaude: true,
        selectPerplexity: true,
    })
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
    const [productsToBeSelected, setProductsToBeSelected] = useState<ResourceType[]>([]);
    const [productsToBeRemoved, setProductsToBeRemoved] = useState<ResourceType[]>([]);
    const [collectionsToBeSelected, setCollectionsToBeSelected] = useState<ResourceType[]>([]);
    const [collectionsToBeRemoved, setCollectionsToBeRemoved] = useState<ResourceType[]>([]);
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
        const productsAsResources = data.productsData.map((product) => ({
            id: product.productId,
            image: product.productImage,
            title: product.title,
        }))
        const collectionsAsResources = data.collectionsData.map((collection) => ({
            id: collection.collectionId,
            image: collection.collectionImage,
            title: collection.title,
        }))
        setOriginalLlmsDotTxtConfig(data.LLMDotTxtConfigData)
        setDescription(data.LLMDotTxtConfigData?.llmDotTxtDescription || '')
        setProductsToBeSelected(productsAsResources || [])
        setProductsToBeRemoved(productsAsResources || [])
        setCollectionsToBeSelected(collectionsAsResources || [])
        setCollectionsToBeRemoved(collectionsAsResources || [])
        setIncludeProductsStatus(data.LLMDotTxtConfigData?.includeProducts)
        setIncludeCollectionsStatus(data.LLMDotTxtConfigData?.includeCollections)
        setIncludeBlogsStatus(data.LLMDotTxtConfigData?.includeBlogs)
        setIncludePagesStatus(data.LLMDotTxtConfigData?.includePages)
        setProductsRadio(() => {
            if (data.LLMDotTxtConfigData.selectAllProducts) return 'all'
            else if (data.LLMDotTxtConfigData.selectedProducts) return 'selected'
            else return 'except'
        })
        setCollectionsRadio(() => {
            if (data.LLMDotTxtConfigData.selectAllCollections) return 'all'
            else if (data.LLMDotTxtConfigData.selectedCollections) return 'selected'
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

    const handleSaveLLMsDotTxtData = useCallback(async () => {
        try {
            if (productsRadio === 'selected' && savedSelectedProducts.length === 0
                || productsRadio === 'except' && savedExceptSelectedProducts.length === 0)
                return shopify.toast.show('Please select products', { isError: true, duration: 5000 })

            if (collectionsRadio === 'selected' && savedSelectedCollections.length === 0
                || collectionsRadio === 'except' && savedExceptSelectedCollections.length === 0)
                return shopify.toast.show('Please select collections', { isError: true, duration: 5000 })

            setIsPostingLlmsDotTxt(true)

            const response = await fetchPostLlmsDotTxt({
                storeId: data.shopId,
                description,
                includeProducts: includeProductsStatus,
                includeCollections: includeCollectionsStatus,
                productRadioResult: productsRadio,
                collectionRadioResult: collectionsRadio,
                savedSelectedProducts,
                savedSelectedCollections,
                savedExceptSelectedProducts,
                savedExceptSelectedCollections,
                includeBlogs: includeBlogsStatus,
                includePages: includePagesStatus,
                crawlers
            })

            if (response.status === 'Error')
                throw new Error('An error occured')
            setOriginalLlmsDotTxtConfig({
                llmDotTxtDescription: description,
                includeProducts: includeProductsStatus,
                includeCollections: includeCollectionsStatus,
                includeBlogs: includeBlogsStatus,
                includePages: includePagesStatus,
                selectAllProducts: productsRadio === 'all',
                selectedProducts: productsRadio === 'selected',
                exceptSelectedProducts: productsRadio === 'except',
                selectAllCollections: collectionsRadio === 'all',
                selectedCollections: collectionsRadio === 'selected',
                exceptSelectedCollections: collectionsRadio === 'except',
                selectChatGPT: crawlers[0].status,
                selectGemini: crawlers[1].status,
                selectGrok: crawlers[2].status,
                selectDeepSeek: crawlers[3].status,
                selectClaude: crawlers[4].status,
                selectPerplexity: crawlers[5].status,
            })
            setIsPostingLlmsDotTxt(false)
            shopify.toast.show('LLMs.txt updated')
            return
        } catch (error) {
            setIsPostingLlmsDotTxt(false)
            console.error('Handle Save LLMsDotTxt Data Error: ', error)
            shopify.toast.show('Server Error', { duration: 5000, isError: true })
            return
        }
    }, [collectionsRadio, crawlers, data.shopId, description, includeBlogsStatus, includeCollectionsStatus, includePagesStatus, includeProductsStatus, productsRadio, savedExceptSelectedCollections, savedExceptSelectedProducts, savedSelectedCollections, savedSelectedProducts])

    return isLoading ? (
        <SkeletonTablePage />
    ) : (
        <Page
            title='LLMs.txt Generator'
            subtitle='Generate Your LLMs.txt File in Seconds — Stay Visible to AI Crawlers'
            backAction={{ content: 'Dashboard', url: '/app' }}
            secondaryActions={<Button external={true} url={`https://${data.shopDomain}/llms.txt`} >View LLMs.txt</Button>}
            primaryAction={<Button onClick={handleSaveLLMsDotTxtData} loading={isPostingLlmsDotTxt} variant="primary">save</Button>}
        >
            <Layout>
                <SaveBarComponentForLlmsDotTxt
                    onSave={handleSaveLLMsDotTxtData}
                    originalConfig={originalLlmsDotTxtConfig}
                    newLlmDotTxtDescription={description}
                    newValueIncludeProducts={includeCollectionsStatus}
                    newValueIncludeCollections={includeCollectionsStatus}
                    newValueSelectAllProducts={productsRadio === 'all'}
                    newValueSelectedProducts={productsRadio === 'selected'}
                    newValueExceptSelectedProducts={productsRadio === 'except'}
                    newValueSelectAllCollections={collectionsRadio === 'all'}
                    newValueSelectedCollections={collectionsRadio === 'selected'}
                    newValueExceptSelectedCollections={collectionsRadio === 'except'}
                    newValueIncludeBlogs={includeBlogsStatus}
                    newValueIncludePages={includePagesStatus}
                    newValueSelectChatGPT={crawlers[0].status}
                    newValueSelectGemini={crawlers[1].status}
                    newValueSelectGrok={crawlers[2].status}
                    newValueSelectDeepSeek={crawlers[3].status}
                    newValueSelectClaude={crawlers[4].status}
                    newValueSelectPerplexity={crawlers[5].status}
                    resetLlmsDotTxtDescription={setDescription}
                    resetIncludeProducts={setIncludeProductsStatus}
                    resetIncludeCollections={setIncludeCollectionsStatus}
                    resetProductsRadio={setProductsRadio}
                    resetCollectionsRadio={setCollectionsRadio}
                    resetIncludeBlogs={setIncludeBlogsStatus}
                    resetIncludePages={setIncludePagesStatus}
                    resetCrawlers={setCrawlers}
                />
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

                        {/* Selected Products */}
                        <GenericResourceSelectionModal
                            modalOpen={selectProductsOpen}
                            setModalOpen={setSelectProductsOpen}
                            resources={productsToBeSelected}
                            setResources={setProductsToBeSelected}
                            resourceLabelSingular='Product'
                            resourceLabelPlural='Products'
                            savedSelectedIds={savedSelectedProducts}
                            setSavedSelectedIds={setSavedSelectedProducts}
                            shopId={data.shopId}
                            title='Selected Products'
                            fetchResources={handleFetchNextProductsForModal}
                            paginated={true}
                        />

                        {/* Except Selected Products */}
                        <GenericResourceSelectionModal
                            modalOpen={exceptProductsOpen}
                            setModalOpen={setExceptProductsOpen}
                            resources={productsToBeRemoved}
                            setResources={setProductsToBeRemoved}
                            resourceLabelSingular='Product'
                            resourceLabelPlural='Products'
                            savedSelectedIds={savedExceptSelectedProducts}
                            setSavedSelectedIds={setSavedExceptSelectedProducts}
                            shopId={data.shopId}
                            title='Except Selected Products'
                            fetchResources={handleFetchNextProductsForModal}
                            paginated={true}
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

                        {/* Selected Collections */}
                        <GenericResourceSelectionModal
                            modalOpen={selectCollectionsOpen}
                            setModalOpen={setSelectCollectionsOpen}
                            resources={collectionsToBeSelected}
                            setResources={setCollectionsToBeSelected}
                            resourceLabelSingular='Collection'
                            resourceLabelPlural='Collections'
                            savedSelectedIds={savedSelectedCollections}
                            setSavedSelectedIds={setSavedSelectedCollections}
                            shopId={data.shopId}
                            title='Selected Collections'
                            fetchResources={handleFetchNextCollectionsForModal}
                            paginated={false}
                        />

                        {/* Except Selected Collections */}
                        <GenericResourceSelectionModal
                            modalOpen={exceptCollectionsOpen}
                            setModalOpen={setExceptCollectionsOpen}
                            resources={collectionsToBeRemoved}
                            setResources={setCollectionsToBeRemoved}
                            resourceLabelSingular='Collection'
                            resourceLabelPlural='Collections'
                            savedSelectedIds={savedExceptSelectedCollections}
                            setSavedSelectedIds={setSavedExceptSelectedCollections}
                            shopId={data.shopId}
                            title='Except Selected Collections'
                            fetchResources={handleFetchNextCollectionsForModal}
                            paginated={false}
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
