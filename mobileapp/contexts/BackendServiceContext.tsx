import React, {
	createContext,
	useContext,
	useEffect,
	useState,
	ReactNode,
	useRef,
	useCallback,
	useMemo,
} from "react";
import { BackendService } from "../services/BackendService";
import { BackendEvent, FrameData, ConnectionStatus } from "../types/backend";
import { BACKEND_CONFIG } from "../constants/Config";
import { AppState, AppStateStatus } from "react-native";

/**
 * Context interface for BackendService
 */
interface BackendServiceContextType {
	service: BackendService | null;
	isConnected: boolean;
	connectionStatus: ConnectionStatus;
	lastEvent: BackendEvent | null;
	error: Error | null;
	events: BackendEvent[];
	insights: BackendEvent[];
	isLoading: boolean;
	connectionAttempts: number;
	refreshData: () => Promise<void>;
	connectService: () => Promise<void>;
	disconnectService: () => void;
	resetConnectionAttempts: () => void;
	sendFrame: (frameData: FrameData) => void;
	fetchNews: () => Promise<any>;
}

const BackendServiceContext = createContext<BackendServiceContextType | undefined>(undefined);

/**
 * Custom hook to access the BackendServiceContext
 * @returns The BackendServiceContext
 * @throws Error if used outside of a BackendServiceProvider
 */
export const useBackendService = () => {
	const context = useContext(BackendServiceContext);
	if (context === undefined) {
		throw new Error("useBackendService must be used within a BackendServiceProvider");
	}
	return context;
};

interface BackendServiceProviderProps {
	children: ReactNode;
}

/**
 * Provider for BackendService functionality
 * Handles connection management and event processing
 */
export const BackendServiceProvider: React.FC<BackendServiceProviderProps> = ({ children }) => {
	const [service, setService] = useState<BackendService | null>(null);
	const [isConnected, setIsConnected] = useState(false);
	const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(
		ConnectionStatus.DISCONNECTED
	);
	const [lastEvent, setLastEvent] = useState<BackendEvent | null>(null);
	const [error, setError] = useState<Error | null>(null);
	const [events, setEvents] = useState<BackendEvent[]>([]);
	const [insights, setInsights] = useState<BackendEvent[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	// Track connection attempts internally
	const connectionAttempts = useRef(0);
	const maxConnectionAttempts = BACKEND_CONFIG.RETRY.MAX_ATTEMPTS;
	const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);
	const serviceRef = useRef<BackendService | null>(null);
	const appStateRef = useRef<AppStateStatus>(AppState.currentState);

	// Frame and message sending functions
	const sendFrame = useCallback(
		(frameData: FrameData) => {
			if (!serviceRef.current || !isConnected) {
				console.warn("Cannot send frame, service not connected");
				return;
			}
			serviceRef.current.sendFrame(frameData);
		},
		[isConnected]
	);

	// Fetch historical events and insights from the backend
	const fetchHistoricalData = async () => {
		setIsLoading(true);
		try {
			// Fetch historical events
			const eventsResponse = await fetch(
				`${BACKEND_CONFIG.API_BASE}${BACKEND_CONFIG.ENDPOINTS.EVENTS}`
			);
			if (eventsResponse.ok) {
				const eventsData = await eventsResponse.json();
				setEvents(eventsData);
			}

			// Fetch historical insights
			const insightsResponse = await fetch(
				`${BACKEND_CONFIG.API_BASE}${BACKEND_CONFIG.ENDPOINTS.INSIGHTS}`
			);
			if (insightsResponse.ok) {
				const insightsData = await insightsResponse.json();
				setInsights(insightsData);
			}
		} catch (error) {
			console.error("Error fetching historical data:", error);
			setError(error instanceof Error ? error : new Error("Failed to fetch historical data"));
		} finally {
			setIsLoading(false);
		}
	};

	// Function to refresh data (can be called from any screen)
	const refreshData = async () => {
		await fetchHistoricalData();
	};

	// Internal function to attempt connection
	const attemptConnection = useCallback(async () => {
		const currentService = serviceRef.current;
		if (!currentService) return;

		// Check if we've exceeded the maximum number of attempts
		if (connectionAttempts.current >= maxConnectionAttempts) {
			console.warn(
				`Max connection attempts (${maxConnectionAttempts}) reached. Stopping reconnection attempts.`
			);
			setConnectionStatus(ConnectionStatus.ERROR);
			setError(
				new Error(
					`Failed to connect after ${maxConnectionAttempts} attempts. Please check your connection settings.`
				)
			);
			return;
		}

		try {
			console.log(
				`Attempt ${
					connectionAttempts.current + 1
				}/${maxConnectionAttempts} to connect to backend service...`
			);
			setConnectionStatus(ConnectionStatus.CONNECTING);
			connectionAttempts.current++;
			await currentService.connect();
		} catch (err) {
			console.error(
				`Connection attempt ${connectionAttempts.current}/${maxConnectionAttempts} failed:`,
				err
			);

			// Schedule a retry if we haven't reached the limit
			if (connectionAttempts.current < maxConnectionAttempts) {
				const retryDelay = BACKEND_CONFIG.RETRY.DELAY_MS;
				console.log(`Scheduling retry in ${retryDelay / 1000} seconds...`);

				// Clear any existing timer
				if (reconnectTimerRef.current) {
					clearTimeout(reconnectTimerRef.current);
				}

				// Schedule the retry
				reconnectTimerRef.current = setTimeout(() => {
					attemptConnection();
				}, retryDelay) as unknown as NodeJS.Timeout;
			} else {
				// We've reached the max attempts, update the status
				setConnectionStatus(ConnectionStatus.ERROR);
				setError(err instanceof Error ? err : new Error("Connection failed"));
			}
		}
	}, [maxConnectionAttempts]);

	// Initialize the service and set up event handlers
	useEffect(() => {
		console.log("Initializing BackendService with URL:", BACKEND_CONFIG.WS_URL);
		const newService = new BackendService(BACKEND_CONFIG.WS_URL);
		serviceRef.current = newService;
		setService(newService);

		const handleOpen = () => {
			console.log("Connection opened via context");
			setIsConnected(true);
			setConnectionStatus(ConnectionStatus.CONNECTED);
			setError(null);
			connectionAttempts.current = 0; // Reset attempts counter on successful connection
			fetchHistoricalData();
		};

		const handleEvent = (event: BackendEvent) => {
			console.log("Event received via context:", event);
			setLastEvent(event);

			if (event.type === "insight") {
				setInsights((prev) => [event, ...prev]);
			} else {
				setEvents((prev) => [event, ...prev]);
			}
		};

		const handleError = (err: Error) => {
			console.error("Connection error via context:", err);
			setError(err);
			setIsConnected(false);
			setConnectionStatus(ConnectionStatus.ERROR);
		};

		const handleClose = (closeEvent: any) => {
			console.log("Connection closed via context:", closeEvent.reason);
			setIsConnected(false);
			setConnectionStatus(ConnectionStatus.DISCONNECTED);

			// Attempt to reconnect if app is in foreground
			if (appStateRef.current === "active") {
				if (reconnectTimerRef.current) {
					clearTimeout(reconnectTimerRef.current);
				}
				reconnectTimerRef.current = setTimeout(() => {
					attemptConnection();
				}, BACKEND_CONFIG.RETRY.DELAY_MS) as unknown as NodeJS.Timeout;
			}
		};

		const handleAppStateChange = (nextAppState: AppStateStatus) => {
			// Handle app moving between background and foreground
			if (appStateRef.current.match(/inactive|background/) && nextAppState === "active") {
				console.log("App has come to the foreground");
				// Check if connection is lost and try to reconnect
				if (newService.getReadyState() !== WebSocket.OPEN && !reconnectTimerRef.current) {
					console.log("Connection lost while app was in background, reconnecting...");
					attemptConnection();
				}
			}
			appStateRef.current = nextAppState;
		};

		// Subscribe to app state changes
		const appStateSubscription = AppState.addEventListener("change", handleAppStateChange);

		const unsubscribeOpen = newService.onOpen(handleOpen);
		const unsubscribeEvent = newService.onEvent(handleEvent);
		const unsubscribeError = newService.onError(handleError);
		const unsubscribeClose = newService.onClose(handleClose);

		// Make first connection attempt
		attemptConnection();

		return () => {
			console.log("Cleaning up BackendService");
			unsubscribeOpen();
			unsubscribeEvent();
			unsubscribeError();
			unsubscribeClose();
			appStateSubscription.remove();

			// Clear any pending reconnect timer
			if (reconnectTimerRef.current) {
				clearTimeout(reconnectTimerRef.current);
				reconnectTimerRef.current = null;
			}

			// We no longer disconnect the service here to prevent tab navigation issues
			// The socket will be managed based on the app state instead
		};
	}, [attemptConnection]);

	// Expose a simplified API to consumers that doesn't include connection methods
	const contextValue = useMemo(
		() => ({
			service,
			isConnected,
			connectionStatus,
			lastEvent,
			error,
			events,
			insights,
			isLoading,
			connectionAttempts: connectionAttempts.current,
			refreshData,
			// These methods are intentionally empty/simplified to prevent consumers from triggering connection logic
			connectService: async () => {
				console.log(
					"connectService called by consumer - this is now handled internally by the context"
				);
				return Promise.resolve();
			},
			disconnectService: () => {
				console.log(
					"disconnectService called by consumer - this is now handled internally by the context"
				);
			},
			resetConnectionAttempts: () => {
				console.log(
					"resetConnectionAttempts called by consumer - this is now handled internally by the context"
				);
			},
			sendFrame,
			fetchNews: async () => {
				try {
					const response = await fetch(
						`${BACKEND_CONFIG.API_BASE}${BACKEND_CONFIG.ENDPOINTS.NEWS}`
					);
					if (response.ok) {
						return await response.json();
					} else {
						throw new Error("Failed to fetch news");
					}
				} catch (error) {
					console.error("Error fetching news:", error);
					throw error;
				}
			},
		}),
		[
			service,
			isConnected,
			connectionStatus,
			lastEvent,
			error,
			events,
			insights,
			isLoading,
			refreshData,
			sendFrame,
		]
	);

	return (
		<BackendServiceContext.Provider value={contextValue}>
			{children}
		</BackendServiceContext.Provider>
	);
};
