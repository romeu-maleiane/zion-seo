import '../styles/customBadgeStyle.css'

interface CustomBadgeProps {
    tone: 'success' | 'magic' | 'base' | undefined
    text: string
    onClick?: (...args: any[]) => any
}

function CustomBadge({ text, tone, onClick }: CustomBadgeProps) {
    return (
        <>
            {tone === 'magic' ?
                <div onClick={onClick} className='badge-magic'>
                    {text}
                </div>
                : tone === 'success' ?
                    <div onClick={onClick} className='badge-success'>
                        {text}
                    </div>
                    :
                    <div onClick={onClick} className='badge-base'>
                        {text}
                    </div>
            }
        </>
    )
}

export default CustomBadge
