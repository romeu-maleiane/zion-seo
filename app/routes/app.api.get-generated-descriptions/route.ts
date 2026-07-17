import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticateAdminShop } from "app/utils/authenticatedShop.server";
import { generateDescription } from "app/utils/generateDescription.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  try {
    await authenticateAdminShop(request);
    const formData = await request.formData();
    const productTitle = formData.get("productTitle");
    const keywords = formData.get("keywords");
    const brandName = formData.get("brandName");
    const productDetails = formData.get("productDetails");

    if (typeof productTitle !== "string" || !productTitle || productTitle.length > 250) throw new Error("Missing or invalid productTitle");
    if (typeof brandName !== "string" || brandName.length > 250) throw new Error("Invalid brandName");
    if (typeof productDetails !== "string" || productDetails.length > 4000) throw new Error("Invalid productDetails");
    if (typeof keywords !== "string" || keywords.length > 500) throw new Error("Invalid keywords");

    const generatedDescriptions = await generateDescription({ productTitle, brandName, productDetails, keywords });
    if (generatedDescriptions.status !== "success") {
      return Response.json({ message: "Unable to generate a description" }, { status: 502 });
    }
    return Response.json(generatedDescriptions, { status: 200 });
  } catch (error) {
    console.error("Fetch Generated Descriptions Error: ", error);
    return Response.json({ message: "An error occurred fetching generated descriptions" }, { status: 500 });
  }
};