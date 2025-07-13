export type Options = {
    endpoint: string;
    apiKey: string;
    deployment: string;
    apiVersion: string | undefined;
}

// types for optimizeMetaData function
export type MetaData = {
    optimizedMetaTitle: string;
    optimizedMetaDescription: string;
}

export interface OptimizeMetaDataType {
    productTitle: string;
    keywords: string;
    metaTitle?: string | null;
    metaDescription?: string | null;
}

export type OptimizedMetaDataOutput = {
    optimizedMetaTitle: string | null;
    optimizedMetaDescription: string | null;
    status: string;
}

// types for suggestKeywords function
export interface SuggestKeywordsType {
    productTitle: string;
}

export type SuggestedKeywords = {
    suggestedKeywords: string[];
}

export type SuggestedKeywordsOutput = {
    suggestedKeywords: string[] | null;
    status: string;
}

// types for generateDescription function
export interface GenerateDescriptionsProps {
    productTitle: string
    brandName: string
    productDetails: string
    keywords?: string
}

export type Descriptions = {
    descriptionOne: string
    descriptionTwo: string
}

export type GenerateDescriptionsOutput = {
    descriptionOne: string | null;
    descriptionTwo: string | null;
    status: string;
}