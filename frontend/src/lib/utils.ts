import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, parseISO } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format match time for display
 * Handles both ISO strings and Date objects
 */
export function formatMatchTime(dateInput?: string | Date): string {
  if (!dateInput) return "—";

  try {
    const date = typeof dateInput === "string" ? parseISO(dateInput) : dateInput;
    
    // Format: "Jan 5, 8:15 PM"
    return format(date, "MMM d, h:mm a");
  } catch (error) {
    console.error("Error formatting date:", error);
    return "—";
  }
}

/**
 * Format match date for schedule display
 * Returns: "Monday, January 5, 2026"
 */
export function formatScheduleDate(isoString: string): string {
  try {
    return format(parseISO(isoString), 'EEEE, MMMM d, yyyy');
  } catch {
    return "—";
  }
}

/**
 * Format relative time (e.g., "5 minutes ago")
 */
export function formatRelativeTime(isoString: string): string {
  try {
    return formatDistanceToNow(parseISO(isoString), { addSuffix: true });
  } catch {
    return "—";
  }
}

/**
 * Format time for display with date
 * Returns: "Jan 5, 2026 • 8:15 PM"
 */
export function formatMatchDateTime(isoString: string): string {
  try {
    const date = parseISO(isoString);
    return format(date, "MMM d, yyyy • h:mm a");
  } catch {
    return "—";
  }
}

/**
 * Get status color class for badges
 */
export function getStatusClass(status: string): string {
  const statusLower = status.toLowerCase();
  
  if (statusLower === 'live' || statusLower.includes('inning')) {
    return 'status-live';
  }
  
  if (statusLower === 'finished' || statusLower === 'completed') {
    return 'status-finished';
  }
  
  if (statusLower === 'ns' || statusLower === 'upcoming') {
    return 'status-upcoming';
  }
  
  return 'status-default';
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

/**
 * Format large numbers (e.g., 1200 -> 1.2K)
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

/**
 * Parse score string to get runs and wickets
 * e.g., "118/7" -> { runs: 118, wickets: 7 }
 */
export function parseScore(scoreStr: string): { runs: number; wickets: number } | null {
  if (!scoreStr) return null;
  
  const match = scoreStr.match(/(\d+)\/(\d+)/);
  if (match) {
    return {
      runs: parseInt(match[1], 10),
      wickets: parseInt(match[2], 10)
    };
  }
  
  return null;
}

/**
 * Get team logo URL with fallback
 */
export function getTeamLogoUrl(team: { logo?: string; image_path?: string } | null | undefined): string | null {
  if (!team) return null;
  return team.logo || team.image_path || null;
}

/**
 * Determine if a match is currently live
 */
export function isMatchLive(status: string): boolean {
  const statusLower = status.toLowerCase();
  return statusLower === 'live' || statusLower.includes('inning');
}

/**
 * Determine if a match is finished
 */
export function isMatchFinished(status: string): boolean {
  const statusLower = status.toLowerCase();
  return statusLower === 'finished' || statusLower === 'completed';
}

/**
 * Determine if a match is upcoming
 */
export function isMatchUpcoming(status: string): boolean {
  const statusLower = status.toLowerCase();
  return statusLower === 'ns' || statusLower === 'upcoming';
}

/**
 * Get match link based on status
 */
export function getMatchLink(matchId: string | number, status: string): string {
  const statusLower = status.toLowerCase();
  
  if (statusLower === 'finished' || statusLower === 'completed') {
    return `/match/${matchId}/result`;
  }
  
  if (statusLower === 'ns' || statusLower === 'upcoming') {
    return `/match/${matchId}/schedule`;
  }
  
  // LIVE match → rich detail page
  return `/match/${matchId}`;
}