import { redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { authenticate, } from "app/shopify.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { plan } = params;
  const newPlan = plan === "pro" ? "Pro" : "Starter";

  const { billing, session } = await authenticate.admin(request);
  const shopName = session.shop.replace(".myshopify.com", "");

  try {
    console.log("[billing] requiring plan:", newPlan);

    const result = await billing.require({
      plans: [newPlan],
      onFailure: async () => {
        console.log("[billing] in onFailure, requesting billing for:", newPlan);
        return billing.request({
          plan: newPlan,
          isTest: process.env.NODE_ENV !== "production",
          returnUrl: `https://admin.shopify.com/store/${shopName}/apps/zionseo/app/billing`,
        });
      },
    });

    // In many implementations, `result` is undefined if billing is satisfied
    console.log("[billing] require() normal completion, result:", result);

    return redirect("/app/billing");
  } catch (error: any) {
    // If billing.request() returned/throws a redirect Response, you'll see it here.
    console.log("[billing] require() threw:", error);

    // If it's a Response (like redirect), rethrow it so Remix handles it.
    if (error instanceof Response) {
      throw error;
    }

    // Otherwise it's a real error; maybe show an error page or 500.
    throw error;
  }
};