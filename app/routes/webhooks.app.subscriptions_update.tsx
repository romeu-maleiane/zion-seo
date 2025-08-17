import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import db from "../db.server";

export const action = async ({ request }: ActionFunctionArgs) => {
    const { payload, admin } = await authenticate.webhook(request);

    if(!admin) return new Response()
        
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

    const status = payload.app_subscription.status
    if (status !== 'ACTIVE') {
        await db.store.update({   
            where: {
                storeId: shopId
            },
            data: {
                activePlan: 'free',
            },
        });
    }
    return new Response();
};
