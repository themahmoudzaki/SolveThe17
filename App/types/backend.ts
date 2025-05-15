/**
 * Type definitions for backend communication and data structures
 */

/**
 * Event types that can be received from the backend
 */
export type EventType = "predator" | "normal_activity" | "system" | "insight";

/**
 * Severity levels for events
 */
export type Severity = "low" | "medium" | "high" | "critical";

/**
 * Backend event structure
 */
export interface BackendEvent {
	id: string;
	type: EventType;
	/** ISO timestamp when the event occurred */
	timestamp: string;
	message: string;
	details?: string;

	/** Optional URL to an image related to the event */
	imageUrl?: string;

	/** Optional structured data (primarily for insights) */
	data?: Record<string, any>;
	severity?: Severity;
}

/**
 * Structure for image frame data sent to the backend
 */
export interface FrameData {
	/** Timestamp when the frame was captured (milliseconds since epoch) */
	timestamp: number;

	/** Base64 encoded image data */
	frame: string;

	/** Unique identifier for the device that captured the frame */
	deviceId: string;

	/** Optional metadata about the frame */
	metadata?: {
		width?: number;
		height?: number;
		format?: string;
		location?: {
			latitude: number;
			longitude: number;
		};
	};
}

/**
 * WebSocket close event definition
 */
export interface WebSocketCloseEvent {
	code: number;
	reason: string;
	wasClean: boolean;
}

/**
 * Backend connection status
 */
export enum ConnectionStatus {
	DISCONNECTED = "disconnected",
	CONNECTING = "connecting",
	CONNECTED = "connected",
	ERROR = "error",
}

/**
 * Callback function type definitions
 */
export type EventCallback = (event: BackendEvent) => void;
export type ErrorCallback = (error: Error) => void;
export type CloseCallback = (event: WebSocketCloseEvent) => void;
export type OpenCallback = () => void;
export type StatusCallback = (status: ConnectionStatus) => void;
