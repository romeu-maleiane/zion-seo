import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "app/shopify.server";
import { updateMetaData } from "app/models/updateMetaData.server"
import { GraphqlQueryError } from "@shopify/shopify-api";

export const action = async ({ request }: ActionFunctionArgs) => {
    try {
        const { admin } = await authenticate.admin(request);
        const formData = await request.formData()

        const productId = formData.get('productId')
        const metaTitle = formData.get('metaTitle')
        const metaDescription = formData.get('metaDescription')

        if ((typeof productId) !== 'string' || !productId) throw new Error("Missing or invalid productId");
        if ((typeof metaTitle) !== 'string' || !metaTitle) throw new Error("Missing or invalid metaTitle");
        if ((typeof metaDescription) !== 'string' || !metaDescription) throw new Error("Missing or invalid metaDescription");

        const response = await admin.graphql(
            `#graphql
            mutation UpdateProductSEO($productId: ID!, $metaTitle: String!, $metaDescription: String!) {
                productUpdate(product: {
                    id: $productId,
                    seo: {
                        title: $metaTitle,
                        description: $metaDescription
                    }
                }) {
                    product {
                        id
                        seo {
                            title
                            description
                        }
                    }
                    userErrors {
                        field
                        message
                    }
                }
            }`,
            {
                variables: {
                    productId,
                    metaTitle,
                    metaDescription
                }
            }
        )

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const productData = await response.json()

        const newMetaData = await updateMetaData({ productId, newMetaTitle: metaTitle, newMetaDescription: metaDescription })

        return Response.json({ newMetaData }, { status: 200 })
    } catch (error: any) {
        if (error instanceof GraphqlQueryError) {

            console.error('API Update Meta Data Error: ', error)
            return Response.json({ errors: error.body?.errors }, { status: 500 });
        }
        console.error('API Update Meta Data Error: ', error)
        return Response.json({ message: 'An error occured updating product meta data' }, { status: 500 })
    }
}