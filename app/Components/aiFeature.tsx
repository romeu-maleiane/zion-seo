import { BlockStack, Text, Box, Button, Card, InlineStack, Link } from '@shopify/polaris'
import { Image } from "@unpic/react"
import {
  MagicIcon,
} from '@shopify/polaris-icons';

interface AiFeatureProps {
    title: string
    subTitle: string
    aiCredits: number
    action: () => void
    loading: boolean
}

function AiFeature({title, subTitle, aiCredits, action, loading}: AiFeatureProps) {
    return (
        <>
            <Card  >
                <BlockStack gap='100'>
                    <InlineStack gap='200' wrap={false}>
                        <Image src='/assets/imgs/ia.png' width={40} height={40} alt='ai image' />
                        <BlockStack>
                            <h2 className='Polaris-Text--root Polaris-Text--headingLg Polaris-Text--medium ai-text-color'>{title}</h2>
                            <Text as='p'>
                                {subTitle}
                            </Text>
                        </BlockStack>
                    </InlineStack>
                    <Box paddingBlockStart='100'>
                        <Button loading={loading} onClick={async () => await action()} fullWidth variant='primary' icon={MagicIcon} size='medium'>
                            Generate
                        </Button>
                    </Box>
                    <InlineStack align='space-between'>
                        <Text as='span'>{aiCredits} Credits available</Text>
                        <Link removeUnderline url='sasa'>Buy Credits</Link>
                    </InlineStack>
                </BlockStack>
            </Card>
        </>
    )
}

export default AiFeature
