import { SaveBar } from '@shopify/app-bridge-react';
import { useCallback, useEffect, useState } from 'react';


interface SaveBarProps {
    onSave: () => void;
    resetLlmsDotTxtDescription: (value: string) => void;
    resetIncludeProducts: (value: boolean) => void;
    resetIncludeCollections: (value: boolean) => void;
    resetProductsRadio: (value: 'all' | 'selected' | 'except' | (() => 'all' | 'selected' | 'except')) => void
    resetCollectionsRadio: (value: 'all' | 'selected' | 'except' | (() => 'all' | 'selected' | 'except')) => void
    resetIncludeBlogs: (value: boolean) => void;
    resetIncludePages: (value: boolean) => void;
    resetCrawlers: ([{ label, id, status }]:{
        label: string
        id: string
        status: boolean
    }[]) => void
    originalConfig: {
        llmDotTxtDescription: string
        includeProducts: boolean
        includeCollections: boolean
        includeBlogs: boolean
        includePages: boolean
        selectAllProducts: boolean
        selectedProducts: boolean
        exceptSelectedProducts: boolean
        selectAllCollections: boolean
        selectedCollections: boolean
        exceptSelectedCollections: boolean
        selectChatGPT: boolean
        selectGemini: boolean
        selectGrok: boolean
        selectDeepSeek: boolean
        selectClaude: boolean
        selectPerplexity: boolean
    } 
    newLlmDotTxtDescription: string;
    newValueIncludeProducts: boolean;
    newValueIncludeCollections: boolean;
    newValueSelectAllProducts: boolean;
    newValueSelectedProducts: boolean;
    newValueExceptSelectedProducts: boolean;
    newValueSelectAllCollections: boolean;
    newValueSelectedCollections: boolean;
    newValueExceptSelectedCollections: boolean;
    newValueIncludeBlogs: boolean;
    newValueIncludePages: boolean;
    newValueSelectChatGPT: boolean;
    newValueSelectGemini: boolean;
    newValueSelectGrok: boolean;
    newValueSelectDeepSeek: boolean;
    newValueSelectClaude: boolean;
    newValueSelectPerplexity: boolean;
}



function SaveBarComponentForLlmsDotTxt({
    onSave,
    resetLlmsDotTxtDescription,
    resetIncludeProducts,
    resetIncludeCollections,
    resetProductsRadio,
    resetCollectionsRadio,
    resetIncludeBlogs,
    resetIncludePages,
    resetCrawlers,
    originalConfig,
    newLlmDotTxtDescription,
    newValueIncludeProducts,
    newValueIncludeCollections,
    newValueSelectAllProducts,
    newValueSelectedProducts,
    newValueExceptSelectedProducts,
    newValueSelectAllCollections,
    newValueSelectedCollections,
    newValueExceptSelectedCollections,
    newValueIncludeBlogs,
    newValueIncludePages,
    newValueSelectChatGPT,
    newValueSelectGemini,
    newValueSelectGrok,
    newValueSelectDeepSeek,
    newValueSelectClaude,
    newValueSelectPerplexity, }: SaveBarProps) {
    const [saveBarOpen, setSaveBarOpen] = useState(false);


    const handleSave = () => {
        onSave()
        setSaveBarOpen(false)
    };

    const handleDiscard = useCallback(() => {
        resetLlmsDotTxtDescription(originalConfig.llmDotTxtDescription)
        resetIncludeProducts(originalConfig.includeProducts)
        resetIncludeCollections(originalConfig.includeCollections)
        resetProductsRadio(() => {
            if(originalConfig.selectAllProducts) return 'all'
            else if(originalConfig.selectedProducts) return 'selected'
            else return 'except'
        })
        resetCollectionsRadio(() => {
            if(originalConfig.selectAllProducts) return 'all'
            else if(originalConfig.selectedProducts) return 'selected'
            else return 'except'
        })
        resetIncludeBlogs(originalConfig.includeBlogs)
        resetIncludePages(originalConfig.includePages)
        resetCrawlers([
            {
                label: 'ChatGPT',
                id: 'chatgpt',
                status: originalConfig.selectChatGPT
            },
            {
                label: 'Gemini',
                id: 'gemini',
                status: originalConfig.selectGemini
            },
            {
                label: 'Grok',
                id: 'grok',
                status: originalConfig.selectGrok
            },
            {
                label: 'DeepSeek',
                id: 'deepseek',
                status: originalConfig.selectDeepSeek
            },
            {
                label: 'Claude',
                id: 'claude',
                status: originalConfig.selectClaude
            },
            {
                label: 'Perplexity',
                id: 'perplexity',
                status: originalConfig.selectPerplexity
            },
        ])
        setSaveBarOpen(false)
    }, [originalConfig.includeBlogs, originalConfig.includeCollections, originalConfig.includePages, originalConfig.includeProducts, originalConfig.llmDotTxtDescription, originalConfig.selectAllProducts, originalConfig.selectChatGPT, originalConfig.selectClaude, originalConfig.selectDeepSeek, originalConfig.selectGemini, originalConfig.selectGrok, originalConfig.selectPerplexity, originalConfig.selectedProducts, resetCollectionsRadio, resetCrawlers, resetIncludeBlogs, resetIncludeCollections, resetIncludePages, resetIncludeProducts, resetLlmsDotTxtDescription, resetProductsRadio])


    useEffect(() => {
        if (originalConfig.llmDotTxtDescription !== newLlmDotTxtDescription 
            || originalConfig.includeProducts !== newValueIncludeProducts 
            || originalConfig.includeCollections !== newValueIncludeCollections 
            || originalConfig.selectAllProducts !== newValueSelectAllProducts
            || originalConfig.selectedProducts !== newValueSelectedProducts
            || originalConfig.exceptSelectedProducts !== newValueExceptSelectedProducts
            || originalConfig.selectAllCollections !== newValueSelectAllCollections
            || originalConfig.selectedCollections !== newValueSelectedCollections
            || originalConfig.exceptSelectedCollections !== newValueExceptSelectedCollections
            || originalConfig.includeBlogs !== newValueIncludeBlogs 
            || originalConfig.includePages !== newValueIncludePages 
            || originalConfig.selectChatGPT !== newValueSelectChatGPT 
            || originalConfig.selectGemini !== newValueSelectGemini 
            || originalConfig.selectGrok !== newValueSelectGrok 
            || originalConfig.selectDeepSeek !== newValueSelectDeepSeek 
            || originalConfig.selectClaude !== newValueSelectClaude 
            || originalConfig.selectPerplexity !== newValueSelectPerplexity) {
            
            setSaveBarOpen(true)
            return
        }

        setSaveBarOpen(false)
    }, [newLlmDotTxtDescription, newValueExceptSelectedCollections, newValueExceptSelectedProducts, newValueIncludeBlogs, newValueIncludeCollections, newValueIncludePages, newValueIncludeProducts, newValueSelectAllCollections, newValueSelectAllProducts, newValueSelectChatGPT, newValueSelectClaude, newValueSelectDeepSeek, newValueSelectGemini, newValueSelectGrok, newValueSelectPerplexity, newValueSelectedCollections, newValueSelectedProducts, originalConfig.exceptSelectedCollections, originalConfig.exceptSelectedProducts, originalConfig.includeBlogs, originalConfig.includeCollections, originalConfig.includePages, originalConfig.includeProducts, originalConfig.llmDotTxtDescription, originalConfig.selectAllCollections, originalConfig.selectAllProducts, originalConfig.selectChatGPT, originalConfig.selectClaude, originalConfig.selectDeepSeek, originalConfig.selectGemini, originalConfig.selectGrok, originalConfig.selectPerplexity, originalConfig.selectedCollections, originalConfig.selectedProducts, ])


    return (
        <SaveBar open={saveBarOpen}>
            <button variant="primary" onClick={handleSave} > </button>
            <button onClick={handleDiscard} > </button>
        </SaveBar>
    )
}

export default SaveBarComponentForLlmsDotTxt
