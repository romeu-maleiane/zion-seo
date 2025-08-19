import type { LoaderFunctionArgs } from "@remix-run/node";
import { authenticate, } from "app/shopify.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
    const { plan } = params
    const newPlan = plan === 'pro' ? 'Pro' : 'Starter'

    // start billing
    const { billing, session } = await authenticate.admin(request);
    const shopName = session.shop.replace('.myshopify.com', '')
    await billing.require({
        plans: [newPlan],
        onFailure: async () => billing.request({
            plan: newPlan,
            isTest: true,
            returnUrl: `https://admin.shopify.com/store/${shopName}/apps/zionseo/app/billing`,
        }),
    });


};