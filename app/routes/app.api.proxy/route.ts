import type { LoaderFunctionArgs } from "@remix-run/node"
import { getLlmsDotTxtData } from "app/models/getLlmsDotTxtData.server"
import { generateLlmsDotTxt } from "app/utils/generateLlmsDotTxt"


export const loader = async ({ request }: LoaderFunctionArgs) => {
    try {
        const shopDomain = request.headers.get('x-shop-domain')

        if (!shopDomain) {
            throw new Error("Missing 'shop' query parameter")
        }

        const data = await getLlmsDotTxtData({ storeDomain: shopDomain})

        if (!data) {
            throw new Error("No data found for the given shop domain")
        }

        const llmsDotTxt = generateLlmsDotTxt({ data: data })
        
        return Response.json(llmsDotTxt, { 
            status: 200,
            headers: { "Content-Type": "text/plain", }
         })
    } catch (error) {
        console.error('Proxy Send LLMs.txt Error: ',error)
        return Response.json('Something went wrong generating llms.txt', { 
            status: 500,
            headers: { "Content-Type": "text/plain", } 
        })
    }
}