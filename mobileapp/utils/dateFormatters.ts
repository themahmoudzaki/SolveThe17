/**
 * Date and time formatting utilities for consistent date display across the app
 */

/**
 * Format a date string or timestamp into a human-readable date and time
 * @param date Date string, timestamp, or Date object
 * @returns Formatted date and time string
 */
export function formatDateTime(date: string | number | Date): string {
	const dateObj = typeof date === "string" || typeof date === "number" ? new Date(date) : date;

	if (isNaN(dateObj.getTime())) {
		console.warn("Invalid date provided to formatDateTime:", date);
		return "Invalid date";
	}

	const today = new Date();
	const yesterday = new Date();
	yesterday.setDate(today.getDate() - 1);

	// Use different formats depending on how recent the date is
	if (isSameDay(dateObj, today)) {
		// Today: "Today, 2:30 PM"
		return `Today, ${formatTime(dateObj)}`;
	} else if (isSameDay(dateObj, yesterday)) {
		// Yesterday: "Yesterday, 8:15 AM"
		return `Yesterday, ${formatTime(dateObj)}`;
	} else if (isWithinOneWeek(dateObj, today)) {
		// Within one week: "Monday, 9:45 AM"
		return `${formatDayName(dateObj)}, ${formatTime(dateObj)}`;
	} else {
		// Older: "May 12, 2025, 10:30 AM"
		return `${formatMonthDay(dateObj)}, ${formatTime(dateObj)}`;
	}
}

/**
 * Format a time in 12-hour format with AM/PM
 * @param date Date object
 * @returns Formatted time string
 */
export function formatTime(date: Date): string {
	let hours = date.getHours();
	const minutes = date.getMinutes().toString().padStart(2, "0");
	const ampm = hours >= 12 ? "PM" : "AM";

	hours = hours % 12;
	hours = hours ? hours : 12; // Convert 0 to 12 for 12 AM

	return `${hours}:${minutes} ${ampm}`;
}

/**
 * Check if two dates are the same calendar day
 * @param date1 First date
 * @param date2 Second date
 * @returns True if dates are on the same day
 */
function isSameDay(date1: Date, date2: Date): boolean {
	return (
		date1.getFullYear() === date2.getFullYear() &&
		date1.getMonth() === date2.getMonth() &&
		date1.getDate() === date2.getDate()
	);
}

/**
 * Check if a date is within one week of another date
 * @param date Date to check
 * @param baseDate Date to compare against
 * @returns True if date is within one week of baseDate
 */
function isWithinOneWeek(date: Date, baseDate: Date): boolean {
	const oneWeekAgo = new Date(baseDate);
	oneWeekAgo.setDate(baseDate.getDate() - 7);

	return date >= oneWeekAgo && date <= baseDate;
}

/**
 * Format the day name (e.g., "Monday")
 * @param date Date object
 * @returns Day name
 */
function formatDayName(date: Date): string {
	const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
	return days[date.getDay()];
}

/**
 * Format month and day (e.g., "May 12, 2025")
 * @param date Date object
 * @returns Formatted month, day and year
 */
function formatMonthDay(date: Date): string {
	const months = [
		"January",
		"February",
		"March",
		"April",
		"May",
		"June",
		"July",
		"August",
		"September",
		"October",
		"November",
		"December",
	];

	const month = months[date.getMonth()];
	const day = date.getDate();
	const year = date.getFullYear();

	return `${month} ${day}, ${year}`;
}

/**
 * Format a date as a relative time (e.g., "2 hours ago", "5 minutes ago")
 * @param date Date string, timestamp, or Date object
 * @returns Relative time string
 */
export function formatRelativeTime(date: string | number | Date): string {
	const dateObj = typeof date === "string" || typeof date === "number" ? new Date(date) : date;

	if (isNaN(dateObj.getTime())) {
		console.warn("Invalid date provided to formatRelativeTime:", date);
		return "Invalid date";
	}

	const now = new Date();
	const diffMs = now.getTime() - dateObj.getTime();

	const seconds = Math.floor(diffMs / 1000);
	const minutes = Math.floor(seconds / 60);
	const hours = Math.floor(minutes / 60);
	const days = Math.floor(hours / 24);

	if (days > 30) {
		return formatDateTime(dateObj); // Fall back to standard format if older than a month
	} else if (days > 0) {
		return `${days} ${days === 1 ? "day" : "days"} ago`;
	} else if (hours > 0) {
		return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
	} else if (minutes > 0) {
		return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
	} else {
		return "Just now";
	}
}
