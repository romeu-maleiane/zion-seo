import { AzureOpenAI } from 'openai';
import type { Options, OptimizeMetaDataType, MetaData, OptimizedMetaDataOutput } from '../types/azureOpenAI.types';


const AZURE_DEPLOYMENT_NAME = process.env.AZURE_DEPLOYMENT_NAME || '';
const AZURE_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT || '';
const AZURE_API_KEY = process.env.AZURE_OPENAI_KEY || '';
const AZURE_OPENAI_MODEL = process.env.AZURE_OPENAI_MODEL || ''
const AZURE_API_VERSION = process.env.AZURE_API_VERSION


export const optimizeMetaData = async ({ 
    productTitle, 
    keywords, 
    metaTitle, 
    metaDescription }: OptimizeMetaDataType): Promise<OptimizedMetaDataOutput> => {

    if (!productTitle) {
    throw new Error('Product title not provided');
    }
    if (!keywords) {
    throw new Error('Keywords not provided');
    }

    try {
        const options: Options = { endpoint: AZURE_ENDPOINT, apiKey: AZURE_API_KEY, deployment: AZURE_DEPLOYMENT_NAME, apiVersion: AZURE_API_VERSION }
        const client = new AzureOpenAI(options)


        const response = await client.chat.completions.create(
            {
                messages: [
                    {
                        role: 'system',
                        content: `You are an expert in SEO and AI Search optimization. 
                            Improve or generate the meta title and meta description for a Shopify product based on the information provided.
                            Instructions:
                            Use clear, natural, and compelling language.
                            Apply best practices for both traditional SEO and AI Search visibility (e.g. Google, ChatGPT, Gemini, Copilot).
                            If either the meta title or meta description is missing, generate a new optimized version.
                            If both are provided, enhance and rewrite them for better performance.
                            Avoid duplication, fluff, or keyword stuffing.
                            Keep the meta title under 70 characters and the meta description under 160 characters.
                        `
                    }, {
                        role: "user",
                        content: `Product data:
                            Product title: ${productTitle}
                            Keywords: ${keywords}
                            Current meta title: ${metaTitle} (may be null or empty)
                            Current meta description: ${metaDescription} (may be null or empty)
                            Respond in the following JSON format:
                            {
                                "optimizedMetaTitle": "Optimized title here",
                                "optimizedMetaDescription": "Optimized description here"
                            }
                        `
                    }
                ],
                max_tokens: 300,
                temperature: 0.7,
                top_p: 0.9,
                model: AZURE_OPENAI_MODEL
            },
        );

        const content = response.choices[0]?.message.content
        if (!content) {
            throw new Error('No content returned from OpenAI');
        }
        const OptimizedMetaData = content.replace(/#+|\*\*|```json|```/g, '').trim()

        const { optimizedMetaTitle, optimizedMetaDescription }: MetaData = await JSON.parse(OptimizedMetaData)

        return {
            optimizedMetaTitle, 
            optimizedMetaDescription,
            status: 'success'
        }
    } catch (error) {
        console.error('Optime Meta Data error:', error)
        return {
            optimizedMetaTitle: null, 
            optimizedMetaDescription: null,
            status: 'error'
        }
    }
}


