import type { LoaderFunctionArgs } from '@remix-run/node'
import { BlockStack, Card, Text, Layout, Page, Box, Checkbox, Divider, RadioButton, Button, TextField } from '@shopify/polaris'
import Footer from 'app/Components/footer.component'
import { useCallback, useState } from 'react'


const loader = async ({ request }: LoaderFunctionArgs) => {

}


function LlmsDotTxtPage() {
    const [description, setDescription] = useState<string>('')
    const [includeProductsStatus, setIncludeProductsStatus] = useState<boolean>(true)
    const [includeCollectionsStatus, setIncludeCollectionsStatus] = useState<boolean>(true)
    const [includeBlogsStatus, setIncludeBlogsStatus] = useState<boolean>(true)
    const [includePagesStatus, setIncludePagesStatus] = useState<boolean>(true)
    const [productsRadio, setProductsRadio] = useState<'all' | 'selected' | 'except'>('all');
    const [collectionsRadio, setCollectionsRadio] = useState<'all' | 'selected' | 'except'>('all');
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



    const handleOnChangeDescription = useCallback((value: string) => setDescription(value), [])

    const handleOnChangeIncludeProducts = useCallback(() => setIncludeProductsStatus(prev => !prev), [])
    const handleOnChangeIncludeCollections = useCallback(() => setIncludeCollectionsStatus(prev => !prev), [])
    const handleOnChangeIncludeBlogs = useCallback(() => setIncludeBlogsStatus(prev => !prev), [])
    const handleOnChangeIncludePages = useCallback(() => setIncludePagesStatus(prev => !prev), [])

    const handleProductsRadioChange = useCallback(
        (value: 'all' | 'selected' | 'except') => setProductsRadio(value),
        []
    );

    const handleCollectionsRadioChange = useCallback(
        (value: 'all' | 'selected' | 'except') => setCollectionsRadio(value),
        []
    );

    const handleOnChageCrawlerStatus = useCallback((id: string) => {
        setCrawlers(prev => prev.map(crawler => crawler.id === id
            ? { ...crawler, status: !crawler.status }
            : crawler
        ))
    }, [])

    return (
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
                                        </BlockStack>
                                    </Box>
                                    : null
                                }
                            </BlockStack>
                        </Box>

                        <Divider />

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
