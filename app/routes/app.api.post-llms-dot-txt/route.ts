import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticateAdminShop } from "app/utils/authenticatedShop.server";
import { postLlmsDotTxt } from "app/models/postLlmsDotTxt.server";

type Choice = "all" | "selected" | "except";
type Crawler = { label: string; id: string; status: boolean };
const crawlerIds = new Set(["chatgpt", "gemini", "grok", "deepseek", "claude", "perplexity"]);

function arrayField(formData: FormData, name: string) {
  const value = formData.get(name);
  if (typeof value !== "string") throw new Error(`Missing ${name}`);
  const parsed: unknown = JSON.parse(value);
  if (!Array.isArray(parsed) || parsed.some((item) => typeof item !== "string")) throw new Error(`Invalid ${name}`);
  return parsed.slice(0, 1000);
}

export const action = async ({ request }: ActionFunctionArgs) => {
  try {
    const { shopId } = await authenticateAdminShop(request);
    const formData = await request.formData();
    const productRadioResult = formData.get("productRadioResult");
    const collectionRadioResult = formData.get("collectionRadioResult");
    const crawlersValue = formData.get("crawlers");

    if (!["all", "selected", "except"].includes(String(productRadioResult)) || !["all", "selected", "except"].includes(String(collectionRadioResult))) {
      return Response.json({ message: "Invalid selection mode" }, { status: 400 });
    }
    if (typeof crawlersValue !== "string") return Response.json({ message: "Missing crawlers" }, { status: 400 });
    const crawlers: unknown = JSON.parse(crawlersValue);
    if (!Array.isArray(crawlers) || crawlers.some((item): item is Crawler => typeof item !== "object" || item === null || !crawlerIds.has(String((item as Crawler).id)) || typeof (item as Crawler).status !== "boolean")) {
      return Response.json({ message: "Invalid crawlers" }, { status: 400 });
    }

    const response = await postLlmsDotTxt({
      storeId: shopId,
      description: String(formData.get("description") || "").slice(0, 4000),
      includeProducts: formData.get("includeProducts") === "true",
      includeCollections: formData.get("includeCollections") === "true",
      productRadioResult: productRadioResult as Choice,
      collectionRadioResult: collectionRadioResult as Choice,
      savedSelectedProducts: arrayField(formData, "savedSelectedProducts"),
      savedSelectedCollections: arrayField(formData, "savedSelectedCollections"),
      savedExceptSelectedProducts: arrayField(formData, "savedExceptSelectedProducts"),
      savedExceptSelectedCollections: arrayField(formData, "savedExceptSelectedCollections"),
      includeBlogs: formData.get("includeBlogs") === "true",
      includePages: formData.get("includePages") === "true",
      crawlers: crawlers as Crawler[],
    });

    if (response.status !== 200) throw new Error("Unable to save LLMs.txt configuration");
    return Response.json({ message: "LLMs.txt configuration saved" }, { status: 200 });
  } catch (error) {
    console.error("Api Post LLMS.txt Error:", error);
    return Response.json({ message: "Internal Server Error" }, { status: 500 });
  }
};