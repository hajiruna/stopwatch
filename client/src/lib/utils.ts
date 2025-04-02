import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format milliseconds to HH:MM:SS.ms format
 * @param ms Milliseconds to format
 * @param includeMilliseconds Whether to include milliseconds in the output
 * @returns Formatted time string
 */
export function formatTime(ms: number, includeMilliseconds = true): string {
  if (ms < 0) ms = 0;
  
  const totalSeconds = Math.floor(ms / 1000);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const totalHours = Math.floor(totalMinutes / 60);
  
  const hours = totalHours;
  const minutes = totalMinutes % 60;
  const seconds = totalSeconds % 60;
  const milliseconds = Math.floor((ms % 1000) / 10); // Get only 2 digits
  
  // Format with leading zeros
  const formattedHours = hours.toString().padStart(2, '0');
  const formattedMinutes = minutes.toString().padStart(2, '0');
  const formattedSeconds = seconds.toString().padStart(2, '0');
  const formattedMilliseconds = milliseconds.toString().padStart(2, '0');
  
  return includeMilliseconds
    ? `${formattedHours}:${formattedMinutes}:${formattedSeconds}.${formattedMilliseconds}`
    : `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
}
