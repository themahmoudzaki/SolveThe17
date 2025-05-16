import { DEV_WS_URL, DEV_API_BASE, PROD_WS_URL, PROD_API_BASE } from "@env";

/**
 * Central configuration file for the application
 * Contains all configurable parameters and environment-specific settings
 */

/**
 * App version information
 */
export const APP_VERSION = {
	VERSION: "1.0.0",
	BUILD: "101",
	ENV: __DEV__ ? "development" : "production",
	COPYRIGHT_YEAR: "2025",
	COMPANY_NAME: "Catfish Con.",
};

/**
 * API configuration for the backend services
 */
export const BACKEND_CONFIG = {
	// Base URL for WebSocket communication
	WS_URL: __DEV__ ? DEV_WS_URL : PROD_WS_URL,

	// Base URL for REST API endpoints
	API_BASE: __DEV__ ? DEV_API_BASE : PROD_API_BASE,

	// API Endpoints
	ENDPOINTS: {
		EVENTS: "/events",
		INSIGHTS: "/insights",
		USERS: "/users",
		ANALYTICS: "/analytics",
		NEWS: "/news",
	},

	// Connection retry settings
	RETRY: {
		MAX_ATTEMPTS: 5,
		DELAY_MS: 3000, // 3 seconds between retries
	},

	// Request timeouts
	TIMEOUTS: {
		DEFAULT: 10000, // 10 seconds
		UPLOAD: 30000, // 30 seconds for uploads
	},
};
