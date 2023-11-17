export function currentTimestampAndDate(): string {
    const now = new Date();
    const timestamp = Math.floor(now.getTime() / 1000);
    const formattedDate = now.toISOString(); // Or use any other format you prefer

    return `Timestamp: ${timestamp}, Date: ${formattedDate}`;
}