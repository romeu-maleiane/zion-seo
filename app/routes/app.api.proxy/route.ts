import type { LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "app/shopify.server";
import { getLlmsDotTxtData } from "app/models/getLlmsDotTxtData.server";
import { generateLlmsDotTxt } from "app/utils/generateLlmsDotTxt";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const { admin } = await authenticate.public.appProxy(request);
    if (!admin) return new Response("App proxy session not found", { status: 401 });

    const shopResponse = await admin.graphql(`#graphql
      query AppProxyShop { shop { id } }
    `);
    const shopResult = await shopResponse.json();
    const storeId = shopResult.data?.shop?.id;
    if (typeof storeId !== "string") return new Response("Shop not found", { status: 404 });

    const data = await getLlmsDotTxtData({ storeId });
    if (!data) return new Response("LLMs.txt is not configured", { status: 404 });

    return new Response(generateLlmsDotTxt({ data }), {
      status: 200,
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=300" },
    });
  } catch (error) {
    console.error("Proxy Send LLMs.txt Error: ", error);
    return new Response("Unable to generate llms.txt", { status: 500 });
  }
};