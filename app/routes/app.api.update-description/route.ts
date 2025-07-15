import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "app/shopify.server";
import { updatedProductDescription } from "app/models/updateDescription.server"
import { GraphqlQueryError } from "@shopify/shopify-api";

export const action = async ({ request }: ActionFunctionArgs) => {
    try {
        const { admin } = await authenticate.admin(request);
        const formData = await request.formData()

        const productId = formData.get('productId')
        const newProductDescription = formData.get('newProductDescription')

        if ((typeof productId) !== 'string' || !productId) throw new Error("Missing or invalid productId");
        if ((typeof newProductDescription) !== 'string' || !newProductDescription) throw new Error("Missing or invalid newProductDescription");

        const response = await admin.graphql(
            `#graphql
            mutation UpdateProduct($productId: ID!, $newProductDescription: String!) {
                productUpdate(product: {
                    id: $productId,
                    descriptionHtml: $newProductDescription
                }) {
                    product {
                        id
                        description
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
                    newProductDescription,
                }
            }
        )

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const productData = await response.json()

        const newDescription = await updatedProductDescription({ productId, newProductDescription,  })

        return Response.json({ newDescription }, { status: 200 })
    } catch (error: any) {
        if (error instanceof GraphqlQueryError) {

            console.error('API Update Description Error: ', error)
            return Response.json({ errors: error.body?.errors }, { status: 500 });
        }
        console.error('API Update Description Error: ', error)
        return Response.json({ message: 'An error occured updating product description' }, { status: 500 })
    }
}