
interface UpdateCreditsType {
    shopId: string
    aiCredits: number
    creditsToBeSubtracted: number
}

export const updateAiCredits = async ({ shopId, aiCredits, creditsToBeSubtracted }: UpdateCreditsType) => {
    try {
        const formData = new FormData()

        formData.append('shopId', shopId)
        formData.append('aiCredits', aiCredits.toString())
        formData.append('creditsToBeSubtracted', creditsToBeSubtracted.toString())

        const res = await fetch('/app/api/update-ai-credits', {
            method: 'POST',
            body: formData
        })
        
        if(res.status === 500) throw new Error("Update aiCredits failed");

        const newAiCredits = await res.json()

        return newAiCredits
    } catch (error) {
        console.error('Update aiCredits error: ', error)
        return null
    }

}