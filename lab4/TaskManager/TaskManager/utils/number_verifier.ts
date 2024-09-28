export default function isValidNumber(value: number): boolean {
    return !isNaN(value) && value >= 0;
}