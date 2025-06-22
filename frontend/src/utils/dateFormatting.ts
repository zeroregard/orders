function getOrdinalSuffix(day: number): string {
  if (day > 3 && day < 21) return 'th';
  switch (day % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  // Format: Jun 15th, 2025
  const month = d.toLocaleString('en-US', { month: 'short' });
  const day = d.getDate();
  const year = d.getFullYear();
  
  return `${month} ${day}${getOrdinalSuffix(day)}, ${year}`;
} 