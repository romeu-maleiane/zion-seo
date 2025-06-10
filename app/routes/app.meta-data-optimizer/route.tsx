import type { LoaderFunctionArgs, } from "@remix-run/node";
import { Badge, ChoiceList, Frame, Icon, IndexFilters, IndexTable, InlineStack, Layout, Link, Page, RangeSlider, TextField, Thumbnail, useBreakpoints, useSetIndexFiltersMode } from '@shopify/polaris'
import CardAiSeoOptimizer from 'app/Components/cardAiSeoOptimizer'
import { useCallback, useEffect, useState } from 'react'
import {
    ComposeIcon
} from '@shopify/polaris-icons';
import type { IndexFiltersProps } from '@shopify/polaris';
import { GraphqlQueryError } from "@shopify/shopify-api";
import { authenticate } from "app/shopify.server";
import prisma from "app/db.server";
import { useLoaderData } from "@remix-run/react";
import { formatDate } from "app/utils/formateDate";
import Footer from "app/Components/footer.component";

type Data = {
    productsData: {
        productId: string;
        productImage: string | null;
        title: string;
        currentMetaTitle: string;
        currentMetaDescription: string;
        generatedDescription: string | null;
        generatedMetaTitle: string | null;
        createdAt: Date | string;
    }[]
    storeId: string;
}

type Product = {
    productId: string;
    productImage: string | null;
    title: string;
    currentMetaTitle: string;
    currentMetaDescription: string;
    generatedDescription: string | null;
    generatedMetaTitle: string | null;
    createdAt: Date | string;

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

        const productsData = await prisma.product.findMany({
            take: 15,
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



        return Response.json({ productsData, storeId: shopData.data.shop.id }, { status: 200 })
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
    const { productsData } = data;
    const [products, setProducts] = useState<Array<Product>>(productsData)
    const [page, setPage] = useState(0)
    const [hasNextPage, setHasNextPage] = useState(products.length === 15)
    const [loading, setLoading] = useState(false)
    const [rowMarkup, setRowMarkup] = useState<Array<JSX.Element> | null>(null)
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

    const handleChangePage = async (nextPage: number) => {
        try {
            setLoading(true)
            const storeId = data.storeId.replace('gid://shopify/Shop/', '');
            const result = await fetch(`/app/api/getproducts/${storeId}/${nextPage}`)

            const fetchData = await result.json()

            setHasNextPage(fetchData?.hasNextPage)
            setProducts(fetchData?.products)
            setRowMarkup(Array.from(products).map(
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
                                source={productImage || "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-image_large.png"}
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
            ))
            setLoading(false)
        } catch (error) {
            console.error('Error fetching products:', error);
            setLoading(false);
            return;

        }
    }

    useEffect(() => {
        (() => {
            setRowMarkup(Array.from(products).map(
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
                                source={productImage || "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-image_large.png"}
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
            ))
        })()

    }, [products])

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
                            itemCount={products.length}
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
                                hasNext: hasNextPage,
                                onNext: () => {
                                    setPage(currentPage => {
                                        const newPage = currentPage + 1
                                        handleChangePage(newPage)
                                        return newPage
                                    })
                                },
                                hasPrevious: page !== 0,
                                onPrevious: () => {
                                    setPage(currentPage => {
                                        const newPage = currentPage - 1
                                        handleChangePage(newPage)
                                        return newPage
                                    })
                                }
                            }}
                            loading={loading}
                        >
                            {rowMarkup}
                        </IndexTable>
                    </Layout.Section>
                    
                    <Layout.Section>
                        <Footer />
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

