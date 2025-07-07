import { SaveBar } from '@shopify/app-bridge-react';
import { useCallback, useEffect, useState } from 'react';


interface SaveBarProps {
    onSave: () => void;
    resetMetaTitle?: (value: string) => void;
    resetMetaDescription?: (value: string) => void;
    resetDescription?: (value: string) => void;
    originalMetaTitle?: string;
    originalMetaDescription?: string;
    originalDescription?: string;
    newMetaTitle?: string;
    newMetaDescription?: string;
    newDescription?: string;
}

function SaveBarComponent({
    onSave,
    resetMetaTitle,
    resetMetaDescription,
    resetDescription,
    originalMetaTitle,
    originalMetaDescription,
    originalDescription,
    newMetaTitle,
    newMetaDescription,
    newDescription }: SaveBarProps) {
    const [saveBarOpen, setSaveBarOpen] = useState(false);


    const handleSave = () => {
        onSave()
        setSaveBarOpen(false)
    };

    const handleDiscard = useCallback(() => {
        if (resetMetaTitle) resetMetaTitle(originalMetaTitle || '')
        if (resetMetaDescription) resetMetaDescription(originalMetaDescription || '')
        if (resetDescription) resetDescription(originalDescription || '')
        setSaveBarOpen(false)
    }, [originalDescription, originalMetaDescription, originalMetaTitle, resetDescription, resetMetaDescription, resetMetaTitle])


    useEffect(() => {
        if (originalMetaTitle !== newMetaTitle || originalMetaDescription !== newMetaDescription || originalDescription !== newDescription) {
            setSaveBarOpen(true)
            return
        }

        setSaveBarOpen(false)
    }, [newDescription, newMetaDescription, newMetaTitle, originalDescription, originalMetaDescription, originalMetaTitle])


    return (
        <SaveBar open={saveBarOpen}>
            <button variant="primary" onClick={handleSave} > </button>
            <button onClick={handleDiscard} > </button>
        </SaveBar>
    )
}

export default SaveBarComponent
