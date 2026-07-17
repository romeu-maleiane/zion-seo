import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { planFromSubscription, scheduleCancellation, syncActiveSubscription } from "app/models/creditLifecycle.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { payload } = await authenticate.webhook(request);
  const subscription = payload.app_subscription;
  const plan = planFromSubscription(subscription.name);

  if (subscription.status === "ACTIVE" && plan) {
    await syncActiveSubscription(subscription.admin_graphql_api_shop_id, plan, {
      id: subscription.id,
      currentPeriodEnd: subscription.current_period_end,
    });
  }

  // Shopify sends this event for cancellations made inside or outside the app.
  // Persisting the period end keeps paid access intact until it naturally expires.
  if (subscription.status === "CANCELLED") {
    await scheduleCancellation(subscription.admin_graphql_api_shop_id, {
      id: subscription.id,
      currentPeriodEnd: subscription.current_period_end,
    });
  }

  return new Response();
};