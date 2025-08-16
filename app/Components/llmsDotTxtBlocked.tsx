import { Banner, Text, BlockStack, Card, EmptyState } from '@shopify/polaris'
import { LockIcon } from '@shopify/polaris-icons'
import '../styles/featureBlockedStyle.css'

function LlmsDotTxtBlocked() {
    return (
        <BlockStack gap='200'>
            <Banner
                title="LLMs.txt generator is not available on the FREE plan"
                tone="warning"
                action={{ content: 'Upgrade subscription', url: '' }}
                icon={LockIcon}
            >
                <p>
                    Upgrade your subscription to generate LLMs.txt files
                </p>
            </Banner>

            <Card>
                <BlockStack gap='400'>
                    <BlockStack gap='100'>
                        <Text as='h3' variant='headingMd' fontWeight='medium'>
                            LLMs.txt Generator
                        </Text>
                        <Text as='p' variant='bodyLg'>
                            Automatically generates an LLMs.txt file optimized for AI crawlers and indexing,
                            making it easier to discover and utilize LLM resources.
                            Serves as a structured guide for AI systems and crawlers to quickly
                            and accurately categorize language models.
                        </Text>
                    </BlockStack>

                    <Card>
                        <EmptyState
                            heading="Generate your LLMs.txt"
                            action={{ content: 'Upgrade subscription', url: '' }}
                            image='/assets/imgs/empty-state.png'
                            imageContained
                        >
                            <p>Upgrade your subcription and generate LLMs.txt file to increase your visibility for AI Crawlers.</p>
                        </EmptyState>
                    </Card>
                </BlockStack>
            </Card>
        </BlockStack>
    )
}

export default LlmsDotTxtBlocked
