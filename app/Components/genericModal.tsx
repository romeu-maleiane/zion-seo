import { Modal, TitleBar } from '@shopify/app-bridge-react';
import { Text, IndexTable, Thumbnail, Filters, useIndexResourceState } from '@shopify/polaris';
import { useCallback, useEffect, useState } from 'react';
import { useDebounce } from "app/hook/useDebounce";

type Resource = {
    id: string;
    image: string | null;
    title: string;
};

interface GenericResourceSelectionModalProps<T extends Resource> {
    modalOpen: boolean;
    setModalOpen: (value: boolean) => void;
    resources: T[];
    setResources: (value: T[]) => void;
    savedSelectedIds: string[];
    setSavedSelectedIds: (value: string[]) => void;
    shopId: string;
    title: string;
    resourceLabelSingular: string;
    resourceLabelPlural: string;
    fetchResources: ({ page, query, shopId }: { page?: number, query?: string, shopId: string} ) => Promise<{ resources: T[]; hasNextPage?: boolean }>;
    paginated?: boolean;
}

enum SelectionType {
    All = 'all',
    Page = 'page',
    Multi = 'multi',
    Single = 'single',
    Range = 'range',
}

export function GenericResourceSelectionModal<T extends Resource>({
    modalOpen,
    setModalOpen,
    resources,
    setResources,
    savedSelectedIds,
    setSavedSelectedIds,
    shopId,
    title,
    resourceLabelSingular,
    resourceLabelPlural,
    fetchResources,
    paginated = false,
}: GenericResourceSelectionModalProps<T>) {
    const [page, setPage] = useState<number>(0);
    const [hasNextPage, setHasNextPage] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [searchLoading, setSearchLoading] = useState<boolean>(false);
    const [queryValue, setQueryValue] = useState('');
    const debouncedQuery = useDebounce(queryValue, 1000);

    const {
        selectedResources,
        allResourcesSelected,
        handleSelectionChange,
        clearSelection,
    } = useIndexResourceState(resources);

    // Reset selection to saved when cancel
    const handleSetCancel = useCallback(() => {
        clearSelection();
        savedSelectedIds.forEach(id => {
            handleSelectionChange(SelectionType.Single, true, id);
        });
    }, [clearSelection, handleSelectionChange, savedSelectedIds]);

    // Save selection
    const handleSaveSelectedResources = useCallback(() => {
        setSavedSelectedIds(selectedResources);
    }, [selectedResources, setSavedSelectedIds]);

    // Fetch resources (search/pagination)
    const handleGetResources = useCallback(async ({ page = 0, query = '' }) => {
        setLoading(true);
        try {
            const { resources: newResources, hasNextPage: next } = await fetchResources({ page, query, shopId });
            setResources(newResources);
            setHasNextPage(!!next);
        } catch (error) {
            console.error('Error fetching resources:', error);
        }
        setLoading(false);
    }, [fetchResources, setResources, shopId]);

    // Search
    useEffect(() => {
        setPage(0);
        setSearchLoading(true);
        handleGetResources({ page: 0, query: debouncedQuery });
        setSearchLoading(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedQuery]);

    // Row markup
    const rowMarkup = resources.map(({ id, image, title }, index) => (
        <IndexTable.Row
            id={id}
            key={id}
            selected={selectedResources.includes(id)}
            position={index}
        >
            <IndexTable.Cell>
                <Thumbnail
                    source={image || "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-image_large.png"}
                    size="small"
                    alt={`${resourceLabelSingular} image`}
                />
            </IndexTable.Cell>
            <IndexTable.Cell>
                <Text as='p'>{title || '—'}</Text>
            </IndexTable.Cell>
        </IndexTable.Row>
    ));

    return (
        <Modal id="resource-modal" open={modalOpen} onHide={() => { handleSetCancel(); setModalOpen(false); }}>
            <Filters
                queryValue={queryValue}
                queryPlaceholder={`Search ${resourceLabelPlural.toLowerCase()}`}
                onQueryChange={setQueryValue}
                onQueryClear={() => setQueryValue('')}
                filters={[]}
                onClearAll={() => setQueryValue('')}
                loading={searchLoading || loading}
            />
            <IndexTable
                itemCount={resources.length}
                selectedItemsCount={allResourcesSelected ? 'All' : selectedResources.length}
                onSelectionChange={handleSelectionChange}
                headings={[
                    { title: '' },
                    { title: `${resourceLabelSingular} name` },
                ]}
                {...(paginated && {
                    pagination: {
                        hasNext: hasNextPage,
                        onNext: () => {
                            setPage(currentPage => {
                                const newPage = currentPage + 1;
                                handleGetResources({ page: newPage, query: debouncedQuery });
                                return newPage;
                            });
                        },
                        hasPrevious: page !== 0,
                        onPrevious: () => {
                            setPage(currentPage => {
                                const newPage = currentPage - 1;
                                handleGetResources({ page: newPage, query: debouncedQuery });
                                return newPage;
                            });
                        }
                    }
                })}
            >
                {rowMarkup}
            </IndexTable>
            <TitleBar title={title}>
                <button
                    disabled={savedSelectedIds.length === selectedResources.length}
                    onClick={() => { handleSaveSelectedResources(); setModalOpen(false); }}
                    variant="primary"
                >
                    Save
                </button>
                <button onClick={() => { handleSetCancel(); setModalOpen(false); }}>Cancel</button>
            </TitleBar>
        </Modal>
    );
}