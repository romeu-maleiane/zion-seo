import { BlockStack, Box, Button, Icon, InlineStack, Tag, TextField } from '@shopify/polaris'
import { XCircleIcon } from '@shopify/polaris-icons'

interface KeywordInputType {
    keyWordInputValue: string
    keyWords: string[]
    handleOnChangeKeyWordInputValue: (keyWord: string) => void
    handleAddKeyWord: () => void
    handleRemoveKeyWord: (index: number) => void
}
function KeywordInput({ keyWordInputValue, keyWords, handleOnChangeKeyWordInputValue, handleAddKeyWord, handleRemoveKeyWord }: KeywordInputType) {
    return (
        <BlockStack gap='200'>
            <InlineStack blockAlign='end' align='space-between'>
                <div style={{ width: '85%' }}>
                    <TextField
                        value={keyWordInputValue}
                        onChange={handleOnChangeKeyWordInputValue}
                        label="Provide keywords for our AI"
                        type="text"
                        placeholder="e.g. organic cotton, eco-friendly, summer collection"
                        autoComplete="Provide keywords for our AI"
                        requiredIndicator
                    />
                </div>
                <div style={{ width: '13%' }}>
                    <Button onClick={handleAddKeyWord} fullWidth size="large">Add</Button>
                </div>
            </InlineStack>
            {keyWords &&
                <Box>
                    <InlineStack gap='200' align='start'>
                        {keyWords.map((keyWord, index) => (
                            <Tag key={index}>
                                <InlineStack gap='100'>
                                    <span>{keyWord}</span>
                                    <span onClick={() => handleRemoveKeyWord(index)}><Icon source={XCircleIcon} /></span>
                                </InlineStack>
                            </Tag>
                        ))}
                    </InlineStack>
                </Box>
            }
        </BlockStack>
    )
}

export default KeywordInput
