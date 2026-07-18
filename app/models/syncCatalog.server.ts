import { createOrUpdateBlogs } from "app/models/createOrUpdateBlog.server";
import { createOrUpdateCollections } from "app/models/createOrUpdateCollection.server";
import { createOrUpdatePages } from "app/models/createOrUpdate.server";
import { createOrUpdateProducts } from "app/models/createOrUpdateProduct.server";
import {
  BLOGS_QUERY,
  COLLECTIONS_QUERY,
  PAGES_QUERY,
  PRODUCTS_QUERY_FREE,
  PRODUCTS_QUERY_PRO,
  PRODUCTS_QUERY_STARTER,
} from "app/utils/graphqlQuerysAndMutations";

export async function syncCatalog(admin: any, shopId: string, shopDomain: string, activePlan: string) {
  const productQuery = activePlan === "pro" ? PRODUCTS_QUERY_PRO : activePlan === "starter" ? PRODUCTS_QUERY_STARTER : PRODUCTS_QUERY_FREE;
  const [products, collections, blogs, pages] = await Promise.all([
    admin.graphql(productQuery),
    admin.graphql(COLLECTIONS_QUERY),
    admin.graphql(BLOGS_QUERY),
    admin.graphql(PAGES_QUERY),
  ]);
  const [productsData, collectionsData, blogsData, pagesData] = await Promise.all([
    products.json(), collections.json(), blogs.json(), pages.json(),
  ]);
  await Promise.all([
    createOrUpdateProducts(productsData.data.products.edges, shopId),
    createOrUpdateCollections(collectionsData.data.collections.nodes, shopDomain, shopId),
    createOrUpdateBlogs(blogsData.data.blogs.nodes, shopDomain, shopId),
    createOrUpdatePages(pagesData.data.pages.nodes, shopDomain, shopId),
  ]);
}