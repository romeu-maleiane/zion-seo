import { AzureOpenAI } from 'openai';
import type { Options, SuggestKeywordsType, SuggestedKeywords, SuggestedKeywordsOutput } from '../types/azureOpenAI.types';


const AZURE_DEPLOYMENT_NAME = process.env.AZURE_DEPLOYMENT_NAME || '';
const AZURE_OPENAI_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT || '';
const AZURE_API_KEY = process.env.AZURE_OPENAI_KEY || '';
const AZURE_OPENAI_MODEL = process.env.AZURE_OPENAI_MODEL || ''
const AZURE_API_VERSION = process.env.AZURE_API_VERSION


export const suggestKeywords = async ({ productTitle, }: SuggestKeywordsType): Promise<SuggestedKeywordsOutput> => {
    if (!productTitle) {
        throw new Error('Product title not provided');
    }
    try {
        const options: Options = { endpoint: AZURE_OPENAI_ENDPOINT, apiKey: AZURE_API_KEY, deployment: AZURE_DEPLOYMENT_NAME, apiVersion: AZURE_API_VERSION }
        const client = new AzureOpenAI(options)


        const response = await client.chat.completions.create(
            {
                messages: [
                    {
                        role: 'system',
                        content: `You are an expert in e-commerce SEO and product content optimization. 
                            Your task is to analyze a product title and suggest a list of the most relevant and 
                            high-impact SEO keywords to optimize the product's content.
                        `
                    }, {
                        role: "user",
                        content: `Product title: ${productTitle}
                            Generate a list of 4 to 6 optimized keywords that:
                            - Reflect what shoppers would search for online
                            - Help improve visibility on search engines and AI search tools
                            - Include both short-tail and long-tail keywords when appropriate
                            
                            Respond in the following JSON format:
                            {
                                "suggestedKeywords": [ "keyword1", "keyword2", "keyword3", ...]
                            }
                        `
                    }
                ],
                max_tokens: 200,
                temperature: 0.7,
                top_p: 0.9,
                model: AZURE_OPENAI_MODEL
            },
        );

        const content = response.choices[0]?.message.content
        if (!content) {
            throw new Error('No content returned from OpenAI');
        }
        const suggestedKeywordsData = content.replace(/#+|\*\*|```json|```/g, '').trim()

        const { suggestedKeywords }: SuggestedKeywords = await JSON.parse(suggestedKeywordsData)

        return {
            suggestedKeywords,
            status: 'success'
        }
    } catch (error) {
        console.error('SuggestKeyword erro: ',error)
        return {
            suggestedKeywords: null,
            status: 'error'
        }
    }
}


