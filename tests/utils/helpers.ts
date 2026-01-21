export function generateRandomString(length: number): string {
  return Math.random().toString(36).substring(2, length + 2);
}

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}
