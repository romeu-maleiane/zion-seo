import { Card, Box, Text, InlineGrid, BlockStack, InlineStack, Icon } from '@shopify/polaris'
import { ArrowDownIcon, ArrowUpIcon } from '@shopify/polaris-icons'

interface StoreInformationComponentType {
    countOfProducts: number;
    countOfOptimizedProducts: number;
    countOfOptimizedDescriptions: number;
    countOfOptimizedMetaData: number;
    percentageAdvanceOfOptimizedProducts: number;
    percentageAdvanceOfOptimizedDescriptions: number;
    percentageAdvanceOfOptimizedMetaData: number;
    noDataOfOptimizedProductsYet?: boolean;
    noDataOfDescriptionsYet?: boolean;
    noDataOfMetaDataYet?: boolean;
}


function StoreInformationComponent({
    countOfProducts,
    countOfOptimizedProducts,
    countOfOptimizedDescriptions,
    countOfOptimizedMetaData,
    percentageAdvanceOfOptimizedProducts,
    percentageAdvanceOfOptimizedDescriptions,
    percentageAdvanceOfOptimizedMetaData,
    noDataOfOptimizedProductsYet,
    noDataOfDescriptionsYet,
    noDataOfMetaDataYet, }: StoreInformationComponentType) {

    // const data: Data = useLoaderData();

    // console.log('Store Information Data: ', data)

    // const { countOfProducts,
    //     countOfOptimizedProducts,
    //     countOfOptimizedDescriptions,
    //     countOfOptimizedMetaData,
    //     percentageAdvanceOfOptimizedProducts,
    //     percentageAdvanceOfOptimizedDescriptions,
    //     percentageAdvanceOfOptimizedMetaData,
    //     noDataOfOptimizedProductsYet,
    //     noDataOfDescriptionsYet,
    //     noDataOfMetaDataYet,
    // } = data;


    return (
        <Card >
            <Box paddingBlockEnd='400'>
                <Text as={"h3"} variant="headingLg" fontWeight='bold' children={`Store Information`} />
            </Box>
            <InlineGrid gap="400" columns={{ xs: 1, sm: 2, md: 3, lg: 4 }}>
                <div style={{ minWidth: '25%', maxWidth: '100%' }}>
                    <Card >
                        <BlockStack gap="200">
                            <Text as="h4" variant="headingMd" fontWeight="semibold">
                                Products
                            </Text>
                            <Text as="h5" variant="headingLg" fontWeight='bold'>
                                {countOfProducts}
                            </Text>
                            <Text as="p" variant="bodyMd" >
                                Total Products
                            </Text>
                        </BlockStack>
                    </Card>
                </div>

                <div style={{ minWidth: '25%', maxWidth: '100%' }}>
                    <Card >
                        <BlockStack gap="200">
                            <Text as="h4" variant="headingMd" fontWeight="semibold">
                                Optimized Products
                            </Text>
                            <InlineStack blockAlign='center' gap="200">
                                <Text as="h5" variant="headingLg" fontWeight='bold'>
                                    {countOfOptimizedProducts}
                                </Text>
                                <InlineStack blockAlign='center' gap="0">
                                    {noDataOfOptimizedProductsYet
                                        ?
                                        <Text as='span' tone='base' variant="bodyLg" fontWeight='semibold'>
                                            No data yet
                                        </Text>
                                        : <>
                                            <div style={{ width: 20, height: 20, }}>
                                                {percentageAdvanceOfOptimizedProducts < 0
                                                    ? <Icon source={ArrowDownIcon} tone='critical' />
                                                    : <Icon source={ArrowUpIcon} tone='success' />
                                                }
                                            </div>
                                            <Text as="span" variant="bodyMd" fontWeight='regular' tone="subdued">
                                                {percentageAdvanceOfOptimizedProducts < 0
                                                    ? <Text as='span' tone='base' variant="bodyMd" fontWeight='regular'>
                                                        <Text as='span' tone='critical' variant="bodyLg" fontWeight='semibold'>
                                                            {Math.floor(percentageAdvanceOfOptimizedProducts)}%
                                                        </Text>
                                                        &nbsp;last week
                                                    </Text>
                                                    : <Text as='span' tone="subdued" variant="bodyMd" fontWeight='regular'>
                                                        <Text as='span' tone='success' variant="bodyLg" fontWeight='semibold'>
                                                            {percentageAdvanceOfOptimizedProducts}%
                                                        </Text>
                                                        &nbsp;last week
                                                    </Text>
                                                }
                                            </Text>
                                        </>
                                    }
                                </InlineStack>
                            </InlineStack>
                            <Text as="p" variant="bodyMd" >
                                Total Optimized Products
                            </Text>
                        </BlockStack>
                    </Card>
                </div>

                <div style={{ minWidth: '25%', maxWidth: '100%' }}>
                    <Card >
                        <BlockStack gap="200">
                            <Text as="h4" variant="headingMd" fontWeight="semibold">
                                Optimized Descriptions
                            </Text>
                            <InlineStack blockAlign='center' gap="200">
                                <Text as="h5" variant="headingLg" fontWeight='bold'>
                                    {countOfOptimizedDescriptions}
                                </Text>
                                <InlineStack blockAlign='center' gap="0">
                                    {noDataOfDescriptionsYet
                                        ?
                                        <Text as='span' tone='base' variant="bodyLg" fontWeight='semibold'>
                                            No data yet
                                        </Text>
                                        : <>
                                            <div style={{ width: 20, height: 20, }}>
                                                {percentageAdvanceOfOptimizedDescriptions < 0
                                                    ? <Icon source={ArrowDownIcon} tone='critical' />
                                                    : <Icon source={ArrowUpIcon} tone='success' />
                                                }
                                            </div>
                                            <Text as="span" variant="bodyMd" fontWeight='regular' tone="subdued">
                                                {percentageAdvanceOfOptimizedDescriptions < 0
                                                    ? <Text as='span' tone='base' variant="bodyMd" fontWeight='regular'>
                                                        <Text as='span' tone='critical' variant="bodyLg" fontWeight='semibold'>
                                                            {Math.floor(percentageAdvanceOfOptimizedDescriptions)}%
                                                        </Text>
                                                        &nbsp;last week
                                                    </Text>
                                                    : <Text as='span' tone="subdued" variant="bodyMd" fontWeight='regular'>
                                                        <Text as='span' tone='success' variant="bodyLg" fontWeight='semibold'>
                                                            {percentageAdvanceOfOptimizedDescriptions}%
                                                        </Text>
                                                        &nbsp;last week
                                                    </Text>
                                                }
                                            </Text>
                                        </>
                                    }
                                </InlineStack>
                            </InlineStack>
                            <Text as="p" variant="bodyMd" >
                                Total Optimized  Descriptions
                            </Text>
                        </BlockStack>
                    </Card>
                </div>

                <div style={{ minWidth: '25%', maxWidth: '100%' }}>
                    <Card >
                        <BlockStack gap="200">
                            <Text as="h4" variant="headingMd" fontWeight="semibold">
                                Optimized Meta Data
                            </Text>
                            <InlineStack blockAlign='center' gap="200">
                                <Text as="h5" variant="headingLg" fontWeight='bold'>
                                    {countOfOptimizedMetaData}
                                </Text>
                                <InlineStack blockAlign='center' gap="0">
                                    {noDataOfMetaDataYet
                                        ?
                                        <Text as='span' tone='base' variant="bodyLg" fontWeight='semibold'>
                                            No data yet
                                        </Text>
                                        : <>
                                            <div style={{ width: 20, height: 20, }}>
                                                {percentageAdvanceOfOptimizedMetaData < 0
                                                    ? <Icon source={ArrowDownIcon} tone='critical' />
                                                    : <Icon source={ArrowUpIcon} tone='success' />
                                                }
                                            </div>
                                            <Text as="span" variant="bodyMd" fontWeight='regular' tone="subdued">
                                                {percentageAdvanceOfOptimizedMetaData < 0
                                                    ? <Text as='span' tone='base' variant="bodyMd" fontWeight='regular'>
                                                        <Text as='span' tone='critical' variant="bodyLg" fontWeight='semibold'>
                                                            {Math.floor(percentageAdvanceOfOptimizedMetaData)}%
                                                        </Text>
                                                        &nbsp;last week
                                                    </Text>
                                                    : <Text as='span' tone="subdued" variant="bodyMd" fontWeight='regular'>
                                                        <Text as='span' tone='success' variant="bodyLg" fontWeight='semibold'>
                                                            {percentageAdvanceOfOptimizedMetaData}%
                                                        </Text>
                                                        &nbsp;last week
                                                    </Text>
                                                }
                                            </Text>
                                        </>
                                    }
                                </InlineStack>
                            </InlineStack>
                            <Text as="p" variant="bodyMd" >
                                Total Optimized Meta Data
                            </Text>
                        </BlockStack>
                    </Card>
                </div>

            </InlineGrid>
        </Card>
    )
}

export default StoreInformationComponent
