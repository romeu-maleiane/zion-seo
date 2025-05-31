import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  Button,
  BlockStack,
  Box,
  List,
  Link,
  InlineStack,
} from "@shopify/polaris";
import { TitleBar,} from "@shopify/app-bridge-react";
import { authenticate } from "../../shopify.server";



export const loader = async ({ request }: ActionFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  
  return {
    
  };
};

export default function Index() {
//   const fetcher = useFetcher<typeof loader>();

//   const shopify = useAppBridge();
//   const isLoading =
//     ["loading", "submitting"].includes(fetcher.state) &&
//     fetcher.formMethod === "POST";
//   const productId = fetcher.data?.product?.id.replace(
//     "gid://shopify/Product/",
//     "",
//   );

 
//   const publishProduct = () => fetcher.submit({}, { method: "POST" });

  return (
    <Page>
      <h1>hello world</h1>
    </Page>
  );
}
