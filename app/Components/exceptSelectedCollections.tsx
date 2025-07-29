import { Modal, TitleBar } from '@shopify/app-bridge-react';
import { Text, IndexTable, Thumbnail, Filters, useIndexResourceState, } from '@shopify/polaris'
import { useCallback, useEffect, useState } from 'react'
import { useDebounce } from "app/hook/useDebounce";

interface handleGetNextcollectionsType {
    query?: string
}

type CollectionType = {
    collectionId: string;
    collectionImage: string | null;
    title: string;
    showForLlms: boolean;
}

interface ModalComponentProps {
    modalOpen: boolean
    setModalOpen: (value: boolean) => void
    collections: CollectionType[]
    setNewCollections: (value: CollectionType[]) => void
    savedExceptSelectedCollections: string[]
    setSavedExceptSelectedCollections: (value: string[]) => void
    shopId: string
}

enum SelectionType {
    All = 'all',
    Page = 'page',
    Multi = 'multi',
    Single = 'single',
    Range = 'range',
}

function ExceptSelectedCollectionsModal({ modalOpen, setModalOpen, collections, setNewCollections, savedExceptSelectedCollections, setSavedExceptSelectedCollections, shopId }: ModalComponentProps) {
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
    } = useIndexResourceState(collections);

    const handleSetCancel = useCallback(() => {
        clearSelection()
        savedExceptSelectedCollections.forEach(id => {
            handleSelectionChange(SelectionType.Single, true, id);
        });
    }, [clearSelection, handleSelectionChange, savedExceptSelectedCollections])

    const handleSaveSelectedResouces = useCallback(() => {
        setSavedExceptSelectedCollections(selectedResources)
        console.log(savedExceptSelectedCollections)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedResources])



    const handleQueryValueRemove = useCallback(() => setQueryValue(''), []);
    const handleFiltersClearAll = useCallback(() => {
        handleQueryValueRemove();
    }, [handleQueryValueRemove]);

    const handleGetNextcollections = useCallback(async ({query = '', }: handleGetNextcollectionsType) => {
        try {
            setLoading(true)

            const storeId = shopId.replace('gid://shopify/Shop/', '');
            const result = await fetch(`/app/api/llm-dot-txt/getcollections/${storeId}?search=${query}`)

            const fetchData = await result.json()

            setNewCollections(fetchData?.currentCollections)
            setLoading(false)
        } catch (error) {
            console.error('Error fetching llms.txt collections:', error);
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
        setSearchLoading(true)
        handleGetNextcollections({ query: debouncedQuery, })
        setSearchLoading(false)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedQuery])


    useEffect(() => {
        (() => {
            setRowMarkup(Array.from(collections).map(
                (
                    {
                        collectionId,
                        collectionImage,
                        title,
                    },
                    index,
                ) => (
                    <IndexTable.Row
                        id={collectionId}
                        key={collectionId}
                        selected={selectedResources.includes(collectionId)}
                        position={index}
                    >
                        <IndexTable.Cell>
                            <Thumbnail
                                source={collectionImage || "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-image_large.png"}
                                size="small"
                                alt='Collection image'
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

    }, [collections, selectedResources])


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
                    itemCount={collections.length}
                    selectedItemsCount={
                        allResourcesSelected ? 'All' : selectedResources.length
                    }
                    onSelectionChange={handleSelectionChange}
                    headings={[
                        { title: '' },
                        { title: 'Product name' },
                    ]}
                >
                    {rowMarkup}
                </IndexTable>
                <TitleBar title="All collections except selected">
                    <button disabled={savedExceptSelectedCollections.length === selectedResources.length} onClick={() => { handleSaveSelectedResouces(); setModalOpen(false) }} variant="primary" >Save</button>
                    <button onClick={() => { handleSetCancel(); setModalOpen(false) }}>cancel</button>
                </TitleBar>
            </Modal>
        </>
    );
}


export default ExceptSelectedCollectionsModal
