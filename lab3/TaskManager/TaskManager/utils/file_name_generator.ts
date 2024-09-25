export default function generateUniqueFileName(originalName: string): string {
    const fileExtension = originalName.split('.').pop();
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 10000);

    return `${timestamp}-${randomNum}.${fileExtension}`;
}
