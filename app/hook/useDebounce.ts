import { useEffect, useState } from "react"


export const useDebounce = (value: string, delay = 500) => {
    const [debouncedValue, setDebounceValue] = useState('')

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebounceValue(value)
        }, delay);
        
        return () => clearTimeout(handler)
    },[value, delay])
    console.log(`useDebounce: value=${value}, debouncedValue=${debouncedValue}, delay=${delay}`)
    return debouncedValue
}