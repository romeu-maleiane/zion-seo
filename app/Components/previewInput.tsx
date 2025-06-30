import { BlockStack, Text, Box, Card, Divider, Icon, InlineStack, Thumbnail } from '@shopify/polaris'
import { MenuVerticalIcon } from '@shopify/polaris-icons'
import { Image } from "@unpic/react"

interface PreviewInputType {
    productTitle: string 
    metaTitle: string 
    metaDescription: string 
    productPrice: string 
    productImage: string 
}

function PreviewInput({ productTitle, metaTitle, metaDescription, productPrice, productImage }: PreviewInputType) {
    return (
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
                                                        https://storename.com {'>'} products {'>'} {productTitle.toLowerCase().replace(/\s+/g, '-')}
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

                                <div style={{ height: 80, width: 80 }}>
                                    <Thumbnail
                                        source={productImage || '/assets/imgs/placeholder.png'}
                                        size="large"
                                        alt={`${productTitle} Image`}
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
                                <Image src={`${productImage}`} width={140} height={140} alt='ai image' />

                                <Box padding={{ xs: '200', sm: '300' }} paddingBlockStart='0'>
                                    <Text as='h3' variant="headingMd" fontWeight='semibold' breakWord>
                                        {productTitle}
                                    </Text>
                                    <Box paddingBlockStart='200'>
                                        <BlockStack gap='100'>
                                            <Text as='p' variant='bodyLg' fontWeight='semibold' breakWord>
                                                ${productPrice}
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
    )
}

export default PreviewInput
