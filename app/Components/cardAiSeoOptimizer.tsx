import { BlockStack, Text, Button, Card, InlineStack, ProgressBar, Box } from '@shopify/polaris';


interface CardAiSeoOptimizerType {
    activePlan: string | null;
    aiCredits: number | null;
}


function CardAiSeoOptimizer({ activePlan, aiCredits }: CardAiSeoOptimizerType ) {
    // const data: Data = useLoaderData()

    // console.log('CardAiSeoOptimizer Data : ', data)
    // let { activePlan, aiCredits  } = data;
    aiCredits = aiCredits || 0
    const usedCredits = activePlan === 'free' ? 20 - aiCredits : 3000 - aiCredits

    const percentageOfUsedCredits = activePlan === 'free' ? (aiCredits / 20) * 100 : (aiCredits / 3000) * 100

    const progressPercentage = 100 - percentageOfUsedCredits

    return (
        <Card >
            <BlockStack gap="200">
                <InlineStack align='space-between' blockAlign='start'>

                    <div>
                        <Text as="h3" variant="headingSm" fontWeight="bold">
                            AI SEO Optimizer
                        </Text>
                        <Text as='p' variant="bodyMd" fontWeight='regular'>
                            ({activePlan === 'free' ? '20' : '3000'} AI credits)
                        </Text>
                    </div>

                    <Button
                        variant='primary'
                        onClick={() => {
                            window.location.reload();
                        }}>
                        Increase limit
                    </Button>
                </InlineStack>

                <BlockStack gap="100">
                    <Text as='p' variant="bodyMd" fontWeight='regular'>
                        {usedCredits}/{activePlan === 'free' ? '20' : '3000'} Credits
                    </Text>

                    <div style={{ width: '100%' }}>
                        <ProgressBar progress={Math.floor(progressPercentage)} size='small' />
                    </div>
                </BlockStack>
            </BlockStack>
        </Card>
    )
}

export default CardAiSeoOptimizer
