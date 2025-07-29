import  prisma  from '../db.server'


interface PostLlmsDotTxtProps {
    description: string
    includeProducts: boolean
    includeCollections: boolean
    productRadioResult: 'all' | 'selected' | 'except'
    collectionRadioResult: 'all' | 'selected' | 'except'
    savedSelectedProducts: string[]
    savedSelectedCollections: string[]
    savedExceptSelectedProducts: string[]
    savedExceptSelectedCollections: string[]
    includeBlogs: boolean
    includePages: boolean
    crawlers: Array<{
        label: string
        id: string
        status: boolean
    }>
}

export const postLlmsDotTxt = async ({
    description,
    includeProducts,
    includeCollections,
    productRadioResult,
    collectionRadioResult,
    savedSelectedProducts,
    savedSelectedCollections,
    savedExceptSelectedProducts,
    savedExceptSelectedCollections,
    includeBlogs,
    includePages,
    crawlers }: PostLlmsDotTxtProps) => {

    
}