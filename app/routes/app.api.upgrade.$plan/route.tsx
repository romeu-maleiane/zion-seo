import type { LoaderFunctionArgs } from "@remix-run/node";
import { authenticate, } from "app/shopify.server";
import prisma from "app/db.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
    const { plan } = params
    const currentPlan = plan === 'pro' ? 'Pro' : 'Starter'
try{
    // Get shop ID
    const { admin } = await authenticate.admin(request)
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

    // start billing
    const { billing, session } = await authenticate.admin(request);
    const shopName = session.shop.replace('.myshopify.com', '')
    await billing.require({
        plans: [currentPlan],
        onFailure: async () => billing.request({
            plan: currentPlan,
            isTest: true,
            returnUrl: `https://admin.shopify.com/store/${shopName}/apps/zion-seo/billing`,
        }),
    });

    // update active plan
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const data = await prisma.store.update({
        where: { storeId: shopId },
        data: {
            activePlan: currentPlan.toLowerCase()
        }
    })

    // Here you would add the function to send email


    return Response.json({ message: 'Paid successfuly'}, { status: 200 })
} catch(error){
    console.error('API Upgrade Plan Error: ', error)
    return Response.json({message: 'Something went wrong during the payment process'}, 
        { status: 500 }
    )
}
};