import type { LoaderFunctionArgs, } from "@remix-run/node";
import { authenticate, } from "app/shopify.server";
import prisma from "app/db.server";
import { GraphqlQueryError } from "@shopify/shopify-api";
import { useLoaderData, useNavigation } from "@remix-run/react";
import { Card, InlineGrid, Layout, Page } from "@shopify/polaris";
import SkeletonTablePage from "app/Components/skeletonTablePage";
import Footer from "app/Components/footer.component";


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
            "Email support",
            "LLMs.txt generator for AI indexing"
        ],
        url: "/app/api/upgrade/starter"
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
            "Priority email support",
            "LLMs.txt generator for AI indexing"
        ],
        url: "/app/api/upgrade/pro"
    }
];


export const BillingPage = async () => {
    const data = useLoaderData()
    const navigation = useNavigation()
    const isLoading = navigation.state === 'loading'
    return isLoading ? (
        <SkeletonTablePage />
    ) : (
        <Page
            title='Billing'
            backAction={{ content: 'Dashboard', url: '/app' }}
        >
            <Layout>
                <Layout.Section>
                    <Card>
                        
                    </Card>
                    <InlineGrid gap="400" columns={2}>

                    </InlineGrid>
                </Layout.Section>

                <Layout.Section>
                    <InlineGrid>

                    </InlineGrid>
                </Layout.Section>

                <Layout.Section>
                    <Footer />
                </Layout.Section>
            </Layout>
        </Page>
    )
}