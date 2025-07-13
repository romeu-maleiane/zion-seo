import { BlockStack, Icon, InlineStack, Tag, Text } from "@shopify/polaris"
import { MagicIcon, PlusCircleIcon } from "@shopify/polaris-icons"

interface KeywordSuggestionBlockType {
    suggestedKeyWords: string[]
    handleAddSuggestedKeyWord: (index: number) => void
}

function KeywordSuggestionBlock({ suggestedKeyWords, handleAddSuggestedKeyWord }: KeywordSuggestionBlockType) {
    return (
        <BlockStack inlineAlign='start' gap='100'>
            <Text as='span'>Click to add these suggested keywords for our AI engine:</Text>
            <InlineStack gap='200' align='start'>
                {!(suggestedKeyWords.length === 0) ?
                    <>
                        <div style={{ color: 'var(--p-color-text-magic-secondary)' }}>
                            <Icon
                                source={MagicIcon}
                            />
                        </div>
                        {suggestedKeyWords.map((keyWord, index) => (
                            <Tag key={index}>
                                <div style={{ color: 'var(--p-color-text-magic-secondary)' }}>
                                    <InlineStack gap='100'>
                                        <span>{keyWord}</span>
                                        <span onClick={() => handleAddSuggestedKeyWord(index)}><Icon source={PlusCircleIcon} /></span>
                                    </InlineStack>
                                </div>
                            </Tag>
                        ))}
                    </>
                : null}
            </InlineStack>
        </BlockStack>
    )
}

export default KeywordSuggestionBlock
