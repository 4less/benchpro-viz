
export function median(array: number[]): number {
    if (array.length === 0) {
        throw new Error("Array is empty");
    }

    const sorted = [...array].sort((a, b) => a - b); // Clone and sort the array
    const mid = Math.floor(sorted.length / 2);

    return sorted.length % 2 === 0
        ? (sorted[mid - 1] + sorted[mid]) / 2 // Average of two middle numbers for even length
        : sorted[mid]; // Middle number for odd length
}

export function mean(array: number[]): number {
    if (array.length === 0) {
        throw new Error("Array is empty, cannot calculate mean.");
      }
    
      const sum = array.reduce((acc, num) => acc + num, 0);
      return sum / array.length;
}