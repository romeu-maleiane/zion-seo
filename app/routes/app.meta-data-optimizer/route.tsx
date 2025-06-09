import type { LoaderFunctionArgs, } from "@remix-run/node";
import { Badge, ChoiceList, Frame, Icon, IndexFilters, IndexTable, InlineStack, Layout, Link, Page, RangeSlider, Text, TextField, Thumbnail, useBreakpoints, useSetIndexFiltersMode } from '@shopify/polaris'
import CardAiSeoOptimizer from 'app/Components/cardAiSeoOptimizer'
import { useCallback, useState } from 'react'
import {
    ComposeIcon
} from '@shopify/polaris-icons';
import type { IndexFiltersProps } from '@shopify/polaris';
import { GraphqlQueryError } from "@shopify/shopify-api";
import { authenticate } from "app/shopify.server";
import prisma from "app/db.server";
import { useLoaderData } from "@remix-run/react";
import { formatDate } from "app/utils/formateDate";

type Data = {
    products: {
        productId: string;
        productImage: string | null;
        title: string;
        currentMetaTitle: string;
        currentMetaDescription: string;
        generatedDescription: string;
        generatedMetaTitle: string;
        createdAt: string;
    }[]
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

        const products = await prisma.product.findMany({
            where: { storeId: shopData.data.shop.id },
            select: {
                productId: true,
                productImage: true,
                title: true,
                currentMetaTitle: true,
                currentMetaDescription: true,
                generatedDescription: true,
                generatedMetaTitle: true,
                createdAt: true,
            }
        })
        
        console.log('products; ', products )
        

        return Response.json({  products  }, { status: 200 })
    } catch (error) {
        if (error instanceof GraphqlQueryError) {

            console.error('Meta Data Optimizer Error: ', error)
            return Response.json({ errors: error.body?.errors }, { status: 500 });
        }
        console.error('Meta Data Optimizer Error: ', error)
        return Response.json({ message: "An error occurred" }, { status: 500 });
    }
}


function MetaDataOptimizerPage() {
    const data: Data = useLoaderData();
    const { products } = data;
    const { mode, setMode } = useSetIndexFiltersMode();
    const onHandleCancel = () => { };



    const [accountStatus, setAccountStatus] = useState<string[] | undefined>(
        undefined,
    );
    const [moneySpent, setMoneySpent] = useState<[number, number] | undefined>(
        undefined,
    );
    const [taggedWith, setTaggedWith] = useState('');
    const [queryValue, setQueryValue] = useState('');

    const handleAccountStatusChange = useCallback(
        (value: string[]) => setAccountStatus(value),
        [],
    );
    const handleMoneySpentChange = useCallback(
        (value: [number, number]) => setMoneySpent(value),
        [],
    );
    const handleTaggedWithChange = useCallback(
        (value: string) => setTaggedWith(value),
        [],
    );
    const handleFiltersQueryChange = useCallback(
        (value: string) => setQueryValue(value),
        [],
    );
    const handleAccountStatusRemove = useCallback(
        () => setAccountStatus(undefined),
        [],
    );
    const handleMoneySpentRemove = useCallback(
        () => setMoneySpent(undefined),
        [],
    );
    const handleTaggedWithRemove = useCallback(() => setTaggedWith(''), []);
    const handleQueryValueRemove = useCallback(() => setQueryValue(''), []);
    const handleFiltersClearAll = useCallback(() => {
        handleAccountStatusRemove();
        handleMoneySpentRemove();
        handleTaggedWithRemove();
        handleQueryValueRemove();
    }, [
        handleAccountStatusRemove,
        handleMoneySpentRemove,
        handleQueryValueRemove,
        handleTaggedWithRemove,
    ]);

    const filters = [
        {
            key: 'accountStatus',
            label: 'Account status',
            filter: (
                <ChoiceList
                    title="Account status"
                    titleHidden
                    choices={[
                        { label: 'Enabled', value: 'enabled' },
                        { label: 'Not invited', value: 'not invited' },
                        { label: 'Invited', value: 'invited' },
                        { label: 'Declined', value: 'declined' },
                    ]}
                    selected={accountStatus || []}
                    onChange={handleAccountStatusChange}
                    allowMultiple
                />
            ),
            shortcut: true,
        },
        {
            key: 'taggedWith',
            label: 'Tagged with',
            filter: (
                <TextField
                    label="Tagged with"
                    value={taggedWith}
                    onChange={handleTaggedWithChange}
                    autoComplete="off"
                    labelHidden
                />
            ),
            shortcut: true,
        },
        {
            key: 'moneySpent',
            label: 'Money spent',
            filter: (
                <RangeSlider
                    label="Money spent is between"
                    labelHidden
                    value={moneySpent || [0, 500]}
                    prefix="$"
                    output
                    min={0}
                    max={2000}
                    step={1}
                    onChange={handleMoneySpentChange}
                />
            ),
        },
    ];

    const appliedFilters: IndexFiltersProps['appliedFilters'] = [];
    if (accountStatus && !isEmpty(accountStatus)) {
        const key = 'accountStatus';
        appliedFilters.push({
            key,
            label: disambiguateLabel(key, accountStatus),
            onRemove: handleAccountStatusRemove,
        });
    }
    if (moneySpent) {
        const key = 'moneySpent';
        appliedFilters.push({
            key,
            label: disambiguateLabel(key, moneySpent),
            onRemove: handleMoneySpentRemove,
        });
    }
    if (!isEmpty(taggedWith)) {
        const key = 'taggedWith';
        appliedFilters.push({
            key,
            label: disambiguateLabel(key, taggedWith),
            onRemove: handleTaggedWithRemove,
        });
    }

    const orders = [
        {
            id: '1020',
            order: (
                <Text as="span" variant="bodyMd" fontWeight="semibold">
                    #1020
                </Text>
            ),
            date: 'Jul 20 at 4:34pm',
            customer: 'Jaydon Stanton',
            total: '$969.44',
            paymentStatus: <Badge progress="complete">Paid</Badge>,
            fulfillmentStatus: <Badge progress="incomplete">Unfulfilled</Badge>,
        },
        {
            id: '1019',
            order: (
                <Text as="span" variant="bodyMd" fontWeight="semibold">
                    #1019
                </Text>
            ),
            date: 'Jul 20 at 3:46pm',
            customer: 'Ruben Westerfelt',
            total: '$701.19',
            paymentStatus: <Badge progress="partiallyComplete">Partially paid</Badge>,
            fulfillmentStatus: <Badge progress="incomplete">Unfulfilled</Badge>,
        },
        {
            id: '1018',
            order: (
                <Text as="span" variant="bodyMd" fontWeight="semibold">
                    #1018
                </Text>
            ),
            date: 'Jul 20 at 3.44pm',
            customer: 'Leo Carder',
            total: '$798.24',
            paymentStatus: <Badge progress="complete">Paid</Badge>,
            fulfillmentStatus: <Badge progress="incomplete">Unfulfilled</Badge>,
        },
    ];
    const resourceName = {
        singular: 'order',
        plural: 'orders',
    };


    const rowMarkup = Array.from(products).map(
        (
            { productId,
                productImage,
                title,
                currentMetaTitle,
                currentMetaDescription,
                generatedDescription,
                generatedMetaTitle,
                createdAt },
            index,
        ) => (
            <IndexTable.Row
                id={productId}
                key={productId}
                position={index}
            >
                <IndexTable.Cell>
                    <Thumbnail
                        source={productImage || ''}
                        size="small"
                        alt='Product image'
                    />
                </IndexTable.Cell>
                <IndexTable.Cell>{title || '—'}</IndexTable.Cell>
                <IndexTable.Cell>{currentMetaTitle || '—'}</IndexTable.Cell>
                <IndexTable.Cell>
                    {currentMetaDescription || '—'}
                </IndexTable.Cell>
                <IndexTable.Cell>
                    {generatedDescription && generatedMetaTitle 
                        ? <Badge tone='success'>Optimized</Badge> 
                        : <Badge>Not optimized</Badge>
                    }
                </IndexTable.Cell>
                <IndexTable.Cell>
                    {formatDate(createdAt)}
                </IndexTable.Cell>
                <IndexTable.Cell>
                    <InlineStack blockAlign='center' align='center' >
                        <Link url={`/app/optimize-meta-data/${productId}`}>
                            <div style={{ width: '20px', height: '20px' }}>
                                <Icon
                                    source={ComposeIcon}
                                    tone="base"
                                />
                            </div>
                        </Link>
                    </InlineStack>
                </IndexTable.Cell>
            </IndexTable.Row>
        ),
    );
    return (
        <Frame>
            <Page
                title='Meta Data Optimizer'
                backAction={{ content: 'Dashboard', url: '/app' }}
                fullWidth
            >
                <Layout>
                    <Layout.Section>
                        <CardAiSeoOptimizer activePlan='free' aiCredits={12} />
                    </Layout.Section>

                    <Layout.Section>
                        <IndexFilters
                            queryValue={queryValue}
                            queryPlaceholder="Searching in all"
                            onQueryChange={handleFiltersQueryChange}
                            onQueryClear={() => setQueryValue('')}
                            cancelAction={{
                                onAction: onHandleCancel,
                                disabled: false,
                                loading: false,
                            }}
                            selected={0}
                            tabs={[]}
                            filters={filters}
                            appliedFilters={appliedFilters}
                            onClearAll={handleFiltersClearAll}
                            mode={mode}
                            setMode={setMode}
                        />
                        <IndexTable
                            condensed={useBreakpoints().smDown}
                            resourceName={resourceName}
                            itemCount={orders.length}
                            headings={[
                                { title: '' },
                                { title: 'Product name' },
                                { title: 'Meta title' },
                                { title: 'Meta description' },
                                { title: 'Optimize status' },
                                { title: 'Date' },
                                { title: 'Action', alignment: 'center' },
                            ]}
                            pagination={{
                                hasNext: true,
                                onNext: () => { },
                            }}
                        >
                            {rowMarkup}
                        </IndexTable>

                    </Layout.Section>
                </Layout>
            </Page>
        </Frame>
    )
}

export default MetaDataOptimizerPage
function disambiguateLabel(key: string, value: string | any[]): string {
    switch (key) {
        case 'moneySpent':
            return `Money spent is between $${value[0]} and $${value[1]}`;
        case 'taggedWith':
            return `Tagged with ${value}`;
        case 'accountStatus':
            return (value as string[]).map((val) => `Customer ${val}`).join(', ');
        default:
            return value as string;
    }
}

function isEmpty(value: string | string[]): boolean {
    if (Array.isArray(value)) {
        return value.length === 0;
    } else {
        return value === '' || value == null;
    }
}

