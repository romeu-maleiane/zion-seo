import { AzureOpenAI } from 'openai';
import type { Options, GenerateDescriptionsProps, Descriptions, GenerateDescriptionsOutput } from '../types/azureOpenAI.types';


const AZURE_DEPLOYMENT_NAME = process.env.AZURE_DEPLOYMENT_NAME || '';
const AZURE_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT || '';
const AZURE_API_KEY = process.env.AZURE_OPENAI_KEY || '';
const AZURE_OPENAI_MODEL = process.env.AZURE_OPENAI_MODEL || ''
const AZURE_API_VERSION = process.env.AZURE_API_VERSION


export const generateDescription = async ({
    productTitle,
    keywords,
    brandName,
    productDetails }: GenerateDescriptionsProps): Promise<GenerateDescriptionsOutput> => {


    try {
        const options: Options = { endpoint: AZURE_ENDPOINT, apiKey: AZURE_API_KEY, deployment: AZURE_DEPLOYMENT_NAME, apiVersion: AZURE_API_VERSION }
        const client = new AzureOpenAI(options)


        const response = await client.chat.completions.create(
            {
                messages: [
                    {
                        role: 'system',
                        content: `You are a product marketing and SEO expert. Your task is to write a clear, persuasive, 
                            and SEO-optimized product description for an e-commerce store.

                            Instructions:
                            - Use a natural and engaging tone.
                            - Start by highlighting the main benefit of the product.
                            - Clearly explain what the product is and how it helps the customer.
                            - Include key product details, such as features, use cases, and brand name.
                            - Organize the description using short paragraphs or bullet points (if needed).
                            - Emphasize unique selling points and add a strong call to action at the end.
                            - Optimize for both SEO and AI Search platforms like Google, ChatGPT, and Gemini.
                            - Include relevant keywords naturally without keyword stuffing.
                            - Keep the description under 160 words.
                            - If the keywords input is empty, write a great description based on the title and details alone.

                            Output format (JSON):
                            {
                            "descriptionOne": "First optimized product description here",
                            "descriptionTwo": "Second optimized product description here"
                            }
                        `
                    }, {
                        role: "user",
                        content: `Product data:
                            - Title: ${productTitle}
                            - Brand: ${brandName}
                            - Details: ${productDetails}
                            - Keywords: ${keywords} (may be empty)
                        `
                    }
                ],
                max_tokens: 700,
                temperature: 0.7,
                top_p: 0.9,
                model: AZURE_OPENAI_MODEL
            },
        );

        const content = response.choices[0]?.message.content
        if (!content) {
            throw new Error('No content returned from OpenAI');
        }
        const generatedDescriptions = content.replace(/#+|\*\*|```json|```/g, '').trim()

        const { descriptionOne, descriptionTwo }: Descriptions = await JSON.parse(generatedDescriptions)

        return {
            descriptionOne,
            descriptionTwo,
            status: 'success'
        }
    } catch (error) {
        console.error('Generate description error:', error)
        return {
            descriptionOne: null,
            descriptionTwo: null,
            status: 'error'
        }
    }
}


