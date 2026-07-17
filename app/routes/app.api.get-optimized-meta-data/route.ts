import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticateAdminShop } from "app/utils/authenticatedShop.server";
import { optimizeMetaData } from "app/utils/optimizeMetaData.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  try {
    await authenticateAdminShop(request);
    const formData = await request.formData();
    const productTitle = formData.get("productTitle");
    const keywords = formData.get("keywords");
    const metaTitle = formData.get("metaTitle");
    const metaDescription = formData.get("metaDescription");

    if (typeof productTitle !== "string" || !productTitle || productTitle.length > 250) throw new Error("Missing or invalid productTitle");
    if (typeof keywords !== "string" || !keywords || keywords.length > 500) throw new Error("Missing or invalid keywords");
    if (typeof metaTitle !== "string" || metaTitle.length > 255) throw new Error("Invalid metaTitle");
    if (typeof metaDescription !== "string" || metaDescription.length > 1000) throw new Error("Invalid metaDescription");

    const optimizedMetaData = await optimizeMetaData({ productTitle, keywords, metaTitle, metaDescription });
    if (optimizedMetaData.status !== "success") {
      return Response.json({ message: "Unable to optimize metadata" }, { status: 502 });
    }
    return Response.json(optimizedMetaData, { status: 200 });
  } catch (error) {
    console.error("Fetch Meta Data Error: ", error);
    return Response.json({ message: "An error occurred fetching optimized metadata" }, { status: 500 });
  }
};