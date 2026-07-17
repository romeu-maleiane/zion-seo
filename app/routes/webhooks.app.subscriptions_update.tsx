import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { planFromSubscription, reconcileCreditCycle, scheduleCancellation, startCreditCycle } from "app/models/creditLifecycle.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { payload } = await authenticate.webhook(request);
  const subscription = payload.app_subscription;
  const shopId = subscription.admin_graphql_api_shop_id;
  const plan = planFromSubscription(subscription.name);

  if (subscription.status === "ACTIVE" && plan) {
    const store = await reconcileCreditCycle(shopId);
    if (!store || store.activePlan !== plan || store.cancellationAt || !store.creditCycleEndsAt) {
      await startCreditCycle(shopId, plan);
    }
  } else if (subscription.status === "CANCELLED" || subscription.status === "EXPIRED") {
    await scheduleCancellation(shopId);
  }

  return new Response();
};