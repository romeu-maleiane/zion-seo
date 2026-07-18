import type { LoaderFunctionArgs, } from "@remix-run/node";
import { Badge, ChoiceList, Frame, Icon, Text, IndexFilters, IndexTable, InlineStack, Layout, Link, Page, Thumbnail, useBreakpoints, useSetIndexFiltersMode } from '@shopify/polaris'
import CardAiSeoOptimizer from 'app/Components/cardAiSeoOptimizer'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { TextBlockIcon } from '@shopify/polaris-icons';
import type { IndexFiltersProps } from '@shopify/polaris';
import { GraphqlQueryError } from "@shopify/shopify-api";
import { authenticateAdminShop } from "app/utils/authenticatedShop.server";
import prisma from "app/db.server";
import { useLoaderData, useNavigation } from "@remix-run/react";
import { formatDate } from "app/utils/formateDate";
import isEmpty from 'app/utils/isEmpty'
import disambiguateLabel from 'app/utils/disambiguateLabel'
import Footer from "app/Components/footer.component";
import { useDebounce } from "app/hook/useDebounce";
import SkeletonFeaturePage from "app/Components/skeletonFeaturesPage";

type Data = {
    productsData: {
        productId: string;
        productImage: string | null;
        title: string;
        currentDescription: string;
        generatedDescription: string | null;
        createdAt: Date | string;
    }[]
    storeId: string;
    activePlan: string | null;
    aiCredits: number | null;
}

type Product = {
    productId: string;
    productImage: string | null;
    title: string;
    currentDescription: string;
    generatedDescription: string | null;
    createdAt: Date | string;

}

interface handleGetNextProductsType {
    nextPage: number
    query?: string
    onlyNotOptimizedProducts?: boolean
    onlyOptimizedProducts?: boolean
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const { shopId } = await authenticateAdminShop(request);

    try {
        const productsData = await prisma.product.findMany({
            take: 15,
            orderBy: [{ createdAt: "desc" }, { productId: "asc" }],
            where: { storeId: shopId },
            select: {
                productId: true,
                productImage: true,
                title: true,
                currentDescription: true,
                generatedDescription: true,
                createdAt: true,
            }
        })

        const storeBalance = await prisma.store.findUnique({
            where: { storeId: shopId },
            select: {
                activePlan: true,
                aiCredits: true,
            },
        })


        return Response.json({ productsData, storeId: shopId, activePlan: storeBalance?.activePlan, aiCredits: storeBalance?.aiCredits }, { status: 200 })
    } catch (error) {
        if (error instanceof GraphqlQueryError) {
            console.error('Meta Data Optimizer Graphql Error: ', error.body?.errors)
            return Response.json({ message: "Something went wroang loading data" }, { status: 500 });
        }
        console.error('Meta Data Optimizer Loader Error: ', error)
        return Response.json({ message: "Something went wroang loading data" }, { status: 500 });
    }
}


function MetaDataOptimizerPage() {
    const data: Data = useLoaderData();
    const { productsData, activePlan, aiCredits } = data;
    const [products, setProducts] = useState<Array<Product>>(productsData)
    const requestId = useRef(0)
    const hasLoadedInitialProducts = useRef(false)
    const [page, setPage] = useState<number>(0)
    const [hasNextPage, setHasNextPage] = useState<boolean>(products.length === 15)
    const [loading, setLoading] = useState<boolean>(false)
    const navigation = useNavigation()
    const isLoading = navigation.state === 'loading'
    const [searchLoading, setSearchLoading] = useState<boolean>(false)
    const [onlyOptimizedProducts, setOnlyOptimizedProducts] = useState<boolean>(false)
    const [onlyNotOptimizedProducts, setOnlyNotOptimizedProducts] = useState<boolean>(false)
    const { mode, setMode } = useSetIndexFiltersMode();
    const onHandleCancel = () => {
        setQueryValue('')
        setPage(0)
        handleGetNextProducts({ nextPage: 0 })
    };


    const [optimizeStatus, setOptimizeStatus] = useState<string[] | []>(
        [],
    );
    const [queryValue, setQueryValue] = useState('');
    const debouncedQuery = useDebounce(queryValue, 1000)

    const breakPoints = useBreakpoints().smDown

    const handleOptimizeStatusChange = useCallback(
        (value: string[]) => {
            setOptimizeStatus(value)
            if (value[0] === 'optimized') {
                setOnlyOptimizedProducts(true)
                setOnlyNotOptimizedProducts(false)
            }
            else if (value[0] === 'not optimized') {
                setOnlyNotOptimizedProducts(true)
                setOnlyOptimizedProducts(false)
            } else {
                setOnlyOptimizedProducts(false)
                setOnlyNotOptimizedProducts(false)
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    );
    const handleOptimizeStatusRemove = useCallback(
        () => {
            setOptimizeStatus([])
            setOnlyOptimizedProducts(false)
            setOnlyNotOptimizedProducts(false)
            setPage(0)
            setSearchLoading(true)
            handleGetNextProducts({ nextPage: 0, query: debouncedQuery, })
            setSearchLoading(false)
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    );
    const handleQueryValueRemove = useCallback(() => setQueryValue(''), []);
    const handleFiltersClearAll = useCallback(() => {
        handleOptimizeStatusRemove();
        handleQueryValueRemove();
    }, [
        handleOptimizeStatusRemove,
        handleQueryValueRemove,
    ]);

    const filters = [
        {
            key: 'optimizeStatus',
            label: 'Optimize status',
            filter: (
                <ChoiceList
                    title="Optimize status"
                    titleHidden
                    choices={[
                        { label: 'Optimized', value: 'optimized' },
                        { label: 'Not optimized', value: 'not optimized' },
                    ]}
                    selected={optimizeStatus || []}
                    onChange={handleOptimizeStatusChange}
                />
            ),
            shortcut: true,
        },
    ];

    const appliedFilters: IndexFiltersProps['appliedFilters'] = [];
    if (optimizeStatus && !isEmpty(optimizeStatus)) {
        const key = 'optimizeStatus';
        appliedFilters.push({
            key,
            label: disambiguateLabel(key, optimizeStatus),
            onRemove: handleOptimizeStatusRemove,
        });
    }

    const handleGetNextProducts = useCallback(async ({ nextPage, query = "", onlyNotOptimizedProducts = false, onlyOptimizedProducts = false }: handleGetNextProductsType) => {
        const currentRequest = ++requestId.current;
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (query) params.append("search", query);
            if (onlyNotOptimizedProducts) params.append("onlyNotOptimizedProducts", "true");
            if (onlyOptimizedProducts) params.append("onlyOptimizedProducts", "true");
            const storeId = data.storeId.replace("gid://shopify/Shop/", "");
            const result = await fetch("/app/api/description/getproducts/" + storeId + "/" + nextPage + "?" + params.toString());
            if (!result.ok) throw new Error("Unable to load products");
            const fetchData = await result.json();
            if (currentRequest !== requestId.current) return false;
            setHasNextPage(Boolean(fetchData?.hasNextPage));
            setProducts(fetchData?.products ?? []);
            return true;
        } catch (error) {
            if (currentRequest === requestId.current) console.error("Error fetching products:", error);
            return false;
        } finally {
            if (currentRequest === requestId.current) setLoading(false);
        }
    }, [data.storeId]);

    const handleFiltersQueryChange = useCallback(
        (value: string) => {
            setQueryValue(value)
        },
        []
    );

    useEffect(() => {
        if (!hasLoadedInitialProducts.current) {
            hasLoadedInitialProducts.current = true;
            return;
        }
        setPage(0);
        void handleGetNextProducts({ nextPage: 0, query: debouncedQuery, onlyNotOptimizedProducts, onlyOptimizedProducts });
    }, [debouncedQuery, onlyNotOptimizedProducts, onlyOptimizedProducts, handleGetNextProducts]);
    const rowMarkup = useMemo(() =>Array.from(products).map(
                (
                    { productId,
                        productImage,
                        title,
                        currentDescription,
                        generatedDescription,
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
                        <IndexTable.Cell>
                            <Link
                                dataPrimaryLink
                                url={`/app/generate-product-description/${productId.replace('gid://shopify/Product/', '')}`}
                            >
                                {title || ''}
                            </Link>
                        </IndexTable.Cell>
                        <IndexTable.Cell>
                            <div style={{ width: '250px' }}>
                                <Text as='p' truncate>
                                    {currentDescription || ''}
                                </Text>
                            </div>
                        </IndexTable.Cell>
                        <IndexTable.Cell>
                            {generatedDescription
                                ? <Badge tone='success'>Optimized</Badge>
                                : <Badge>Not optimized</Badge>
                            }
                        </IndexTable.Cell>
                        <IndexTable.Cell>
                            {formatDate(createdAt)}
                        </IndexTable.Cell>
                        <IndexTable.Cell>
                            <InlineStack blockAlign='center' align='center' >
                                <Link url={`/app/generate-product-description/${productId.replace('gid://shopify/Product/', '')}`}>
                                    <div style={{ width: '20px', height: '20px' }}>
                                        <Icon
                                            source={TextBlockIcon}
                                            tone="base"
                                        />
                                    </div>
                                </Link>
                            </InlineStack>
                        </IndexTable.Cell>
                    </IndexTable.Row>
                ),
            ), [products]);

    return isLoading ? (
        <SkeletonFeaturePage />
    ) : (
        <Frame>
            <Page
                title='Description Generator'
                backAction={{ content: 'Dashboard', url: '/app' }}
                fullWidth
            >
                <Layout>
                    <Layout.Section>
                        <CardAiSeoOptimizer activePlan={activePlan} aiCredits={aiCredits} />
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
                            loading={searchLoading}
                        />
                        <IndexTable
                            condensed={breakPoints}
                            itemCount={products.length}
                            headings={[
                                { title: '' },
                                { title: 'Product name' },
                                { title: 'Description' },
                                { title: 'Optimize status' },
                                { title: 'Date' },
                                { title: 'Action', alignment: 'center' },
                            ]}
                            pagination={{
                                hasNext: hasNextPage,
                                onNext: async () => { const nextPage = page + 1; if (await handleGetNextProducts({ nextPage, query: debouncedQuery, onlyNotOptimizedProducts, onlyOptimizedProducts })) setPage(nextPage); }, hasPrevious: page !== 0, onPrevious: async () => { const previousPage = page - 1; if (await handleGetNextProducts({ nextPage: previousPage, query: debouncedQuery, onlyNotOptimizedProducts, onlyOptimizedProducts })) setPage(previousPage); }
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
