import { authenticate } from "app/shopify.server";
import { reconcileCreditCycle } from "app/models/creditLifecycle.server";

const SHOP_ID_QUERY = `#graphql
  query AuthenticatedShopId {
    shop {
      id
    }
  }
`;

/** Resolves the canonical shop ID after embedded-admin authentication. */
export async function authenticateAdminShop(request: Request) {
  const { admin, session } = await authenticate.admin(request);
  const response = await admin.graphql(SHOP_ID_QUERY);
  const result = await response.json();
  const shopId = result.data?.shop?.id;

  if (typeof shopId !== "string" || !shopId) {
    throw new Response("Unable to resolve authenticated shop", { status: 401 });
  }

  await reconcileCreditCycle(shopId);
  return { admin, session, shopId };
}