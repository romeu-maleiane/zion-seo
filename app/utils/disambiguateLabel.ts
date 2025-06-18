

export default function disambiguateLabel(key: string, value: string | any[]): string {
    switch (key) {
        case 'optimizeStatus':
            return (value as string[]).map((val) => `Product ${val}`).join(', ');
        default:
            return value as string;
    }
}