export type Options = {
    endpoint: string;
    apiKey: string;
    deployment: string;
    apiVersion: string | undefined;
}

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