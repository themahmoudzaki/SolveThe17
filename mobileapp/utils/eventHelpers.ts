/**
 * Event handling utilities for consistent processing across the app
 */
import { BackendEvent } from "../types/backend";

/**
 * Available event severity levels
 */
export type EventSeverity = "low" | "medium" | "high" | "critical";

/**
 * Determine the severity of an event based on its type and content
 * @param event The backend event to analyze
 * @returns The event severity level
 */
export function getEventSeverity(event: BackendEvent): EventSeverity {
	switch (event.type) {
		case "predator":
			return "critical";
		case "system":
			if (
				event.message.toLowerCase().includes("error") ||
				event.message.toLowerCase().includes("fail")
			) {
				return "high";
			}
			return "medium";
		case "normal_activity":
		default:
			return "low";
	}
}
