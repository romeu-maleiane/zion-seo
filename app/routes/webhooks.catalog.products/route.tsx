import type { ActionFunctionArgs } from "@remix-run/node";
import prisma from "app/db.server";
import { authenticate } from "app/shopify.server";

type ProductPayload = { id: number; admin_graphql_api_id?: string };

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin, payload, shop, topic } = await authenticate.webhook(request);
  const product = payload as ProductPayload;
  const store = await prisma.store.findUnique({ where: { storeDomain: shop }, select: { storeId: true } });
  if (!store) return new Response();

  const productId = product.admin_graphql_api_id ?? `gid://shopify/Product/${product.id}`;
  if (topic === "PRODUCTS_DELETE") {
    await prisma.product.deleteMany({ where: { productId, storeId: store.storeId } });
    return new Response();
  }

  const response = await admin.graphql(`#graphql
    query ProductWebhook($id: ID!) {
      product(id: $id) {
        id title description onlineStoreUrl createdAt
        seo { title description }
        featuredMedia { preview { image { url } } }
        variants(first: 1) { nodes { price } }
      }
    }
  `, { variables: { id: productId } });
  const result = await response.json();
  const source = result.data?.product;
  if (!source) return new Response();

  await prisma.product.upsert({
    where: { productId: source.id },
    update: {
      storeId: store.storeId, title: source.title, currentDescription: source.description,
      currentMetaTitle: source.seo?.title ?? "", currentMetaDescription: source.seo?.description ?? "",
      productImage: source.featuredMedia?.preview?.image?.url ?? null,
      productPrice: Number(source.variants?.nodes?.[0]?.price ?? 0), productUrl: source.onlineStoreUrl ?? "",
      createdAt: new Date(source.createdAt),
    },
    create: {
      productId: source.id, storeId: store.storeId, title: source.title, currentDescription: source.description,
      currentMetaTitle: source.seo?.title ?? "", currentMetaDescription: source.seo?.description ?? "",
      productImage: source.featuredMedia?.preview?.image?.url ?? null,
      productPrice: Number(source.variants?.nodes?.[0]?.price ?? 0), productUrl: source.onlineStoreUrl ?? "",
      createdAt: new Date(source.createdAt),
    },
  });
  return new Response();
};
