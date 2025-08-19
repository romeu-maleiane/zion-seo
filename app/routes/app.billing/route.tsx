import type { LoaderFunctionArgs, } from "@remix-run/node";
import { authenticate, } from "app/shopify.server";
import { GraphqlQueryError } from "@shopify/shopify-api";
import { useLoaderData, useNavigation } from "@remix-run/react";
import { Badge, BlockStack, Box, Card, Text, InlineGrid, InlineStack, Layout, Page, Icon, Button, Banner } from "@shopify/polaris";
import {
    CheckCircleIcon
} from '@shopify/polaris-icons';
import prisma from "app/db.server";
import SkeletonTablePage from "app/Components/skeletonTablePage";
import Footer from "app/Components/footer.component";
import '../../styles/billingStyle.css'
import { useEffect, useState } from "react";

type DataType = {
    activePlan: string
    aiCredits: number
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const { admin } = await authenticate.admin(request);

    try {
        const shopData = await admin.graphql(
            `#graphql
            query shopInfo {
                shop {
                    id
                }
            }
        `,
        );
        const shopId = await shopData.json().then(res => res.data.shop.id)

        const data = await prisma.store.findMany({
            where: { storeId: shopId },
            select: {
                activePlan: true
            }
        })

        const { activePlan } = data[0]
        return Response.json({ activePlan }, { status: 200 })
    } catch (error) {
        if (error instanceof GraphqlQueryError) {
            console.error('Billing Graphql Error: ', error.body?.errors)
            return Response.json({ message: "Something went wroang loading data" }, { status: 500 });
        }
        console.error('Billing Loader Error: ', error)
        return Response.json({ message: "Something went wroang loading data" }, { status: 500 });
    }
}

const plans = [
    {
        name: "Starter",
        price: 18.99,
        oldPrice: 24.99,
        billing: "Billed Monthly",
        description:
            "Ideal for small stores that want to boost product descriptions and SEO with AI-powered optimizations.",
        features: [
            "Optimize up to 100 products",
            "Generate up to 1,800 AI credits",
            "Automatic keywords suggestions",
            "LLMs.txt generator for AI indexing",
            "Email support",
        ],
        url: "/app/upgrade/starter"
    },
    {
        name: "Pro",
        price: 29.99,
        oldPrice: 45.99,
        billing: "Billed Monthly",
        description:
            "Perfect for growing stores that need advanced AI credits, more product optimizations, and priority support.",
        features: [
            "Optimize up to 250 products",
            "Generate up to 4,500 AI credits",
            "Automatic keywords suggestions",
            "LLMs.txt generator for AI indexing",
            "Priority email support",
        ],
        url: "/app/upgrade/pro"
    }
];


function BillingPage() {
    const data: DataType = useLoaderData()
    const [activePlan, setActivePlan] = useState<string>('')
    const navigation = useNavigation()
    const isLoading = navigation.state === 'loading'

    useEffect(() => {
        setActivePlan(data.activePlan)
    }, [data.activePlan])

    return isLoading ? (
        <SkeletonTablePage />
    ) : (
        <Page
            title='Billing'
            backAction={{ content: 'Dashboard', url: '/app' }}
        >
            <Layout>
                <Layout.Section>
                    {activePlan === 'free' ? (
                        <Box paddingBlockEnd='300'>
                            <Banner tone='info'>
                                <p>
                                    You're on the FREE plan. Choose a plan that fits you and upgrade.
                                </p>
                            </Banner>
                        </Box>
                    ) : null}

                    {/* Plans */}
                    <InlineGrid gap="800" columns={2}>
                        {plans.map((plan, i) => (
                            <Card key={i}>
                                <InlineStack align='end'>
                                    {activePlan === plan.name.toLowerCase() ?
                                        <Box>
                                            <Badge tone='success' size='large'>
                                                Current Plan
                                            </Badge>
                                        </Box>
                                        :
                                        <Box paddingBlockEnd='600'>

                                        </Box>
                                    }
                                </InlineStack>

                                <Box>
                                    <BlockStack >
                                        <Text as='h2' variant='headingXl' fontWeight='bold'>
                                            {plan.name}
                                        </Text>

                                        <Text as='p' variant='bodyLg'>
                                            {plan.description}
                                        </Text>
                                    </BlockStack>
                                </Box>

                                <Box paddingBlockStart='800' paddingBlockEnd='200'>
                                    <BlockStack >
                                        <InlineStack blockAlign='end' gap='100'>
                                            <Text as='h3' variant='heading2xl' fontWeight='bold'>
                                                ${plan.price}
                                            </Text>

                                            <Text as='h3' variant='headingLg' fontWeight='medium' textDecorationLine="line-through">
                                                ${plan.oldPrice}
                                            </Text>
                                        </InlineStack>

                                        <Text as='p' variant='bodyLg'>
                                            Billed Monthly
                                        </Text>
                                    </BlockStack>
                                </Box>

                                <Card background='bg-surface-hover'>
                                    <BlockStack gap='100'>
                                        {plan.features.map((feature, index) => (
                                            <InlineStack key={index} gap='100'>
                                                <div style={{ width: 20, height: 20 }}>
                                                    <Icon
                                                        source={CheckCircleIcon}
                                                        tone="info"
                                                    />
                                                </div>
                                                <Text as='p' variant='bodyLg'>
                                                    {feature}
                                                </Text>
                                            </InlineStack>
                                        ))}
                                    </BlockStack>
                                </Card>

                                <Box paddingBlockStart='800'>
                                    <Button url={`${plan.url}`} variant='primary' fullWidth disabled={activePlan === plan.name.toLowerCase()}>
                                        Upgrade
                                    </Button>
                                </Box>
                            </Card>
                        ))}
                    </InlineGrid>
                </Layout.Section>

                <Layout.Section>
                    <InlineGrid columns={{ sm: 1, md: 3, }}>

                    </InlineGrid>
                </Layout.Section>

                <Layout.Section>
                    <Footer />
                </Layout.Section>
            </Layout>
        </Page>
    )
}

export default BillingPage