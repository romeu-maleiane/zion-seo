

export default function isEmpty(value: string | string[]): boolean {
    if (Array.isArray(value)) {
        return value.length === 0;
    } else {
        return value === '' || value == null;
    }
}