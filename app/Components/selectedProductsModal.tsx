import { Modal, TitleBar } from '@shopify/app-bridge-react';
import { Text, IndexTable, Thumbnail, Filters, useIndexResourceState, } from '@shopify/polaris'
import { useCallback, useEffect, useState } from 'react'
import { useDebounce } from "app/hook/useDebounce";

interface handleGetNextProductsType {
    nextPage: number
    query?: string
}

type ProductType = {
    productId: string;
    productImage: string | null;
    title: string;
}

interface ModalComponentProps {
    modalOpen: boolean
    setModalOpen: (value: boolean) => void
    products: ProductType[]
    setNewProducts: (value: ProductType[]) => void
    savedSelectedProducts: string[]
    setSavedSelectedProducts: (value: string[]) => void
    shopId: string
}

enum SelectionType {
    All = 'all',
    Page = 'page',
    Multi = 'multi',
    Single = 'single',
    Range = 'range',
}

export function SelectedProductsModal({ modalOpen, setModalOpen, products, setNewProducts, savedSelectedProducts, setSavedSelectedProducts,shopId }: ModalComponentProps) {
    const [page, setPage] = useState<number>(0)
    const [hasNextPage, setHasNextPage] = useState<boolean>(products.length === 20)
    const [loading, setLoading] = useState<boolean>(false)
    const [searchLoading, setSearchLoading] = useState<boolean>(false)
    const [rowMarkup, setRowMarkup] = useState<Array<JSX.Element> | null>(null)

    const [queryValue, setQueryValue] = useState('');
    const debouncedQuery = useDebounce(queryValue, 1000)

    const {
        selectedResources,
        allResourcesSelected,
        handleSelectionChange,
        clearSelection,
    } = useIndexResourceState(products);


    const handleSetCancel = useCallback(() => {
        clearSelection()
        savedSelectedProducts.forEach(id => {
            handleSelectionChange(SelectionType.Single, true, id);
        });
    }, [clearSelection, handleSelectionChange, savedSelectedProducts])

    const handleSaveSelectedResouces = useCallback(() => {
        setSavedSelectedProducts(selectedResources)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedResources])



    const handleQueryValueRemove = useCallback(() => setQueryValue(''), []);
    const handleFiltersClearAll = useCallback(() => {
        handleQueryValueRemove();
    }, [handleQueryValueRemove]);

    const handleGetNextProducts = useCallback(async ({ nextPage, query = '', }: handleGetNextProductsType) => {
        try {
            setLoading(true)

            const storeId = shopId.replace('gid://shopify/Shop/', '');
            const result = await fetch(`/app/api/llm-dot-txt/getproducts/${storeId}/${nextPage}?search=${query}`)

            const fetchData = await result.json()

            setHasNextPage(fetchData?.hasNextPage)
            setNewProducts(fetchData?.currentProducts)
            setLoading(false)
        } catch (error) {
            console.error('Error fetching llms.txt products:', error);
            setLoading(false);
            return;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [shopId])

    const handleQueryChange = useCallback(
        (value: string) => {
            setQueryValue(value)
        },
        []
    );

    useEffect(() => {
        setPage(0)
        setSearchLoading(true)
        handleGetNextProducts({ nextPage: 0, query: debouncedQuery, })
        setSearchLoading(false)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedQuery])


    useEffect(() => {
        (() => {
            setRowMarkup(Array.from(products).map(
                (
                    {
                        productId,
                        productImage,
                        title,
                    },
                    index,
                ) => (
                    <IndexTable.Row
                        id={productId}
                        key={productId}
                        selected={selectedResources.includes(productId)}
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
                            <Text as='p'>
                                {title || '—'}
                            </Text>
                        </IndexTable.Cell>
                    </IndexTable.Row>
                ),
            ))
        })()

    }, [products, selectedResources])


    return (
        <>
            <Modal id="my-modal" open={modalOpen} onHide={() => { handleSetCancel(); setModalOpen(false) }}>
                <Filters
                    queryValue={queryValue}
                    queryPlaceholder="Searching in all"
                    onQueryChange={handleQueryChange}
                    onQueryClear={() => setQueryValue('')}
                    filters={[]}
                    onClearAll={handleFiltersClearAll}
                    loading={searchLoading || loading}
                />
                <IndexTable
                    itemCount={products.length}
                    selectedItemsCount={
                        allResourcesSelected ? 'All' : selectedResources.length
                    }
                    onSelectionChange={handleSelectionChange}
                    headings={[
                        { title: '' },
                        { title: 'Product name' },
                    ]}
                    pagination={{
                        hasNext: hasNextPage,
                        onNext: () => {
                            setPage(currentPage => {
                                const newPage = currentPage + 1
                                handleGetNextProducts({ nextPage: newPage, query: debouncedQuery, })
                                return newPage
                            })
                        },
                        hasPrevious: page !== 0,
                        onPrevious: () => {
                            setPage(currentPage => {
                                const newPage = currentPage - 1
                                handleGetNextProducts({ nextPage: newPage, query: debouncedQuery, })
                                return newPage
                            })
                        }
                    }}
                >
                    {rowMarkup}
                </IndexTable>
                <TitleBar title="Selected products">
                    <button disabled={savedSelectedProducts.length === selectedResources.length} onClick={() => { handleSaveSelectedResouces(); setModalOpen(false) }} variant="primary" >Save</button>
                    <button onClick={() => { handleSetCancel(); setModalOpen(false) }}>cancel</button>
                </TitleBar>
            </Modal>
        </>
    );
}
