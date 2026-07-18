import type { ActionFunctionArgs } from "@remix-run/node";
import prisma from "app/db.server";
import { syncCatalog } from "app/models/syncCatalog.server";
import { authenticateAdminShop } from "app/utils/authenticatedShop.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin, shopId } = await authenticateAdminShop(request);
  const response = await admin.graphql(`#graphql
    query SyncCatalogShop { shop { primaryDomain { host } } }
  `);
  const result = await response.json();
  const shopDomain = result.data?.shop?.primaryDomain?.host;
  const store = await prisma.store.findUnique({ where: { storeId: shopId }, select: { activePlan: true } });
  if (!store || typeof shopDomain !== "string") return Response.json({ message: "Unable to prepare catalog sync" }, { status: 409 });
  await syncCatalog(admin, shopId, shopDomain, store.activePlan);
  return Response.json({ synced: true });
};
