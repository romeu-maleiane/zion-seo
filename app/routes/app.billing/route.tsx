import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useFetcher, useLoaderData, useNavigation } from "@remix-run/react";
import { Badge, Banner, BlockStack, Box, Button, Card, Icon, InlineGrid, InlineStack, Layout, Modal, Page, Text } from "@shopify/polaris";
import { CheckCircleIcon } from "@shopify/polaris-icons";
import { useEffect, useState } from "react";
import { authenticate, PRO_PLAN, STARTER_PLAN } from "app/shopify.server";
import prisma from "app/db.server";
import Footer from "app/Components/footer.component";
import SkeletonTablePage from "app/Components/skeletonTablePage";
import { scheduleCancellation } from "app/models/creditLifecycle.server";
import { authenticateAdminShop } from "app/utils/authenticatedShop.server";
import "../../styles/billingStyle.css";

type Data = {
  activePlan: string;
  subscriptionStatus: string;
  creditCycleEndsAt: string | null;
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const { shopId } = await authenticateAdminShop(request);
    const store = await prisma.store.findUnique({
      where: { storeId: shopId },
      select: { activePlan: true, subscriptionStatus: true, creditCycleEndsAt: true },
    });
    if (!store) throw new Error("Store not found");
    return Response.json({
      activePlan: store.activePlan,
      subscriptionStatus: store.subscriptionStatus,
      creditCycleEndsAt: store.creditCycleEndsAt?.toISOString() ?? null,
    });
  } catch (error) {
    console.error("Billing Loader Error: ", error);
    return Response.json({ message: "Unable to load billing" }, { status: 500 });
  }
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin, billing } = await authenticate.admin(request);
  const formData = await request.formData();
  if (formData.get("intent") !== "cancel-subscription") {
    return Response.json({ message: "Unsupported action" }, { status: 400 });
  }

  try {
    const billingCheck = await billing.check({
      plans: [STARTER_PLAN, PRO_PLAN],
      isTest: process.env.NODE_ENV !== "production",
    });
    const subscription = billingCheck.appSubscriptions.find((item) => item.status === "ACTIVE");
    if (!subscription || !subscription.currentPeriodEnd) {
      return Response.json({ message: "No active subscription with a future billing end date was found" }, { status: 409 });
    }

    const shopResponse = await admin.graphql(`#graphql
      query BillingShop { shop { id } }
    `);
    const shopResult = await shopResponse.json();
    const shopId = shopResult.data?.shop?.id;
    if (typeof shopId !== "string") throw new Error("Unable to resolve shop");

    await billing.cancel({
      subscriptionId: subscription.id,
      isTest: process.env.NODE_ENV !== "production",
      prorate: false,
    });
    await scheduleCancellation(shopId, subscription, { force: true });

    return Response.json({ cancelled: true, currentPeriodEnd: subscription.currentPeriodEnd });
  } catch (error) {
    console.error("Cancel subscription error: ", error);
    return Response.json({ message: "Unable to cancel subscription" }, { status: 500 });
  }
};

const plans = [
  { name: "Starter", price: 18.99, oldPrice: 24.99, description: "Ideal for small stores that want to boost product descriptions and SEO with AI-powered optimizations.", features: ["Optimize up to 100 products", "Generate up to 1,800 AI credits", "Automatic keywords suggestions", "LLMs.txt generator for AI indexing", "Email support"], url: "/app/upgrade/starter" },
  { name: "Pro", price: 29.99, oldPrice: 45.99, description: "Perfect for growing stores that need advanced AI credits, more product optimizations, and priority support.", features: ["Optimize up to 250 products", "Generate up to 4,500 AI credits", "Automatic keywords suggestions", "LLMs.txt generator for AI indexing", "Priority email support"], url: "/app/upgrade/pro" },
];

export default function BillingPage() {
  const data = useLoaderData<Data>();
  const fetcher = useFetcher<typeof action>();
  const navigation = useNavigation();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelScheduled, setCancelScheduled] = useState(data.subscriptionStatus === "cancel_scheduled");
  const isLoading = navigation.state === "loading";
  const activePlan = data.activePlan;
  const cancellationEnd = fetcher.data?.currentPeriodEnd ?? data.creditCycleEndsAt;

  useEffect(() => {
    if (fetcher.data?.cancelled) {
      setCancelScheduled(true);
      setShowCancelModal(false);
    }
  }, [fetcher.data]);

  if (isLoading) return <SkeletonTablePage />;

  return (
    <Page title="Billing" backAction={{ content: "Dashboard", url: "/app" }}>
      <Layout>
        <Layout.Section>
          {activePlan === "free" ? <Box paddingBlockEnd="300"><Banner tone="info"><p>You&apos;re on the Free plan. Choose a plan that fits you and upgrade.</p></Banner></Box> : null}
          {cancelScheduled && cancellationEnd ? <Box paddingBlockEnd="300"><Banner tone="warning"><p>Your subscription is cancelled and will not renew. Your {activePlan} features and remaining credits stay available until {new Date(cancellationEnd).toLocaleDateString()}.</p></Banner></Box> : null}
          {fetcher.data && !fetcher.data.cancelled ? <Box paddingBlockEnd="300"><Banner tone="critical"><p>{fetcher.data.message}</p></Banner></Box> : null}

          <Modal open={showCancelModal} onClose={() => setShowCancelModal(false)} title="Cancel subscription?" primaryAction={{ content: "Cancel subscription", destructive: true, loading: fetcher.state !== "idle", onAction: () => fetcher.submit({ intent: "cancel-subscription" }, { method: "post" }) }} secondaryActions={[{ content: "Keep plan", onAction: () => setShowCancelModal(false) }]}>
            <Modal.Section><Text as="p">Your plan will not renew. You will keep all paid features and remaining credits until the current billing period ends.</Text></Modal.Section>
          </Modal>

          {activePlan !== "free" && !cancelScheduled ? <Box paddingBlockEnd="300"><Button tone="critical" onClick={() => setShowCancelModal(true)}>Cancel subscription</Button></Box> : null}

          <InlineGrid gap="800" columns={2}>
            {plans.map((plan) => (
              <Card key={plan.name}>
                <InlineStack align="end">{activePlan === plan.name.toLowerCase() ? <Badge tone="success" size="large">Current Plan</Badge> : null}</InlineStack>
                <Box><BlockStack><Text as="h2" variant="headingXl" fontWeight="bold">{plan.name}</Text><Text as="p" variant="bodyLg">{plan.description}</Text></BlockStack></Box>
                <Box paddingBlockStart="800" paddingBlockEnd="200"><InlineStack blockAlign="end" gap="100"><Text as="h3" variant="heading2xl" fontWeight="bold">${plan.price}</Text><Text as="h3" variant="headingLg" fontWeight="medium" textDecorationLine="line-through">${plan.oldPrice}</Text></InlineStack><Text as="p" variant="bodyLg">Billed monthly</Text></Box>
                <Card background="bg-surface-hover"><BlockStack gap="100">{plan.features.map((feature) => <InlineStack key={feature} gap="100"><div style={{ width: 20, height: 20 }}><Icon source={CheckCircleIcon} tone="info" /></div><Text as="p" variant="bodyLg">{feature}</Text></InlineStack>)}</BlockStack></Card>
                <Box paddingBlockStart="800"><Button url={plan.url} variant="primary" fullWidth disabled={activePlan === plan.name.toLowerCase() || cancelScheduled}>Upgrade</Button></Box>
              </Card>
            ))}
          </InlineGrid>
        </Layout.Section>
        <Layout.Section><Footer /></Layout.Section>
      </Layout>
    </Page>
  );
}