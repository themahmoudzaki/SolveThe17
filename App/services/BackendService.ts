import {
	BackendEvent,
	FrameData,
	EventCallback,
	ErrorCallback,
	CloseCallback,
	OpenCallback,
	WebSocketCloseEvent,
	ConnectionStatus,
} from "../types/backend";
import { BACKEND_CONFIG } from "../constants/Config";

/**
 * Service for communicating with the backend server via WebSocket
 * Provides methods for connecting, sending frames, and handling events
 */
export class BackendService {
	private ws: WebSocket | null = null;
	private readonly backendUrl: string;
	private connectionStatus: ConnectionStatus = ConnectionStatus.DISCONNECTED;

	private eventSubscribers: EventCallback[] = [];
	private errorSubscribers: ErrorCallback[] = [];
	private closeSubscribers: CloseCallback[] = [];
	private openSubscribers: OpenCallback[] = [];
	private statusSubscribers: ((status: ConnectionStatus) => void)[] = [];

	/**
	 * Create a new BackendService instance
	 * @param backendUrl The WebSocket URL to connect to
	 */
	constructor(backendUrl: string) {
		this.backendUrl = backendUrl;
		if (!this.backendUrl.startsWith("ws://") && !this.backendUrl.startsWith("wss://")) {
			console.warn("Backend URL should start with ws:// or wss://");
		}
	}

	/**
	 * Connect to the WebSocket server
	 * @returns Promise that resolves when connected
	 */
	public connect(): Promise<void> {
		return new Promise((resolve, reject) => {
			if (this.ws && this.ws.readyState === WebSocket.OPEN) {
				console.log("Already connected.");
				resolve();
				return;
			}

			if (this.ws && this.ws.readyState === WebSocket.CONNECTING) {
				console.log("Connection attempt already in progress.");
				reject(new Error("Connection attempt already in progress."));
				return;
			}

			this.setConnectionStatus(ConnectionStatus.CONNECTING);

			try {
				console.log("Attempting to connect to:", this.backendUrl);
				this.ws = new WebSocket(this.backendUrl);
			} catch (error) {
				console.error("WebSocket constructor failed:", error);
				this.setConnectionStatus(ConnectionStatus.ERROR);
				this.handleError(error instanceof Error ? error : new Error(String(error)));
				reject(error);
				return;
			}

			// Set connection timeout
			const connectionTimeout = setTimeout(() => {
				if (this.ws && this.ws.readyState !== WebSocket.OPEN) {
					this.ws.close();
					const error = new Error("Connection timeout");
					this.setConnectionStatus(ConnectionStatus.ERROR);
					this.handleError(error);
					reject(error);
				}
			}, BACKEND_CONFIG.TIMEOUTS.DEFAULT);

			this.ws.onopen = () => {
				clearTimeout(connectionTimeout);
				this.setConnectionStatus(ConnectionStatus.CONNECTED);
				console.log("BackendService: Connected to WebSocket.");
				this.openSubscribers.forEach((cb) => cb());
				resolve();
			};

			this.ws.onmessage = (event) => {
				try {
					console.log("Received WebSocket message:", event.data);
					const messageData = JSON.parse(event.data as string);
					if (this.isValidBackendEvent(messageData)) {
						console.log("Event validated successfully, dispatching to subscribers");
						this.eventSubscribers.forEach((cb) => cb(messageData as BackendEvent));
					} else {
						console.warn("BackendService: Received malformed event:", messageData);
						this.handleError(new Error("Received malformed event from backend."));
					}
				} catch (error) {
					console.error("BackendService: Error parsing message from backend:", error);
					this.handleError(
						error instanceof Error
							? error
							: new Error("Error parsing message from backend.")
					);
				}
			};

			this.ws.onerror = (event) => {
				const error = new Error(`WebSocket error: ${event}`);
				console.error("BackendService: WebSocket error:", event);
				this.setConnectionStatus(ConnectionStatus.ERROR);
				this.handleError(error);

				if (this.ws && this.ws.readyState !== WebSocket.OPEN) {
					reject(error);
				}
			};

			this.ws.onclose = (event: WebSocketCloseEvent) => {
				console.log(
					`BackendService: WebSocket closed: ${event.code} ${event.reason || ""}`
				);
				this.setConnectionStatus(ConnectionStatus.DISCONNECTED);
				this.closeSubscribers.forEach((cb) => cb(event));
				this.ws = null;

				// We don't attempt to reconnect here - this is now handled by the BackendServiceContext
			};
		});
	}

	/**
	 * Set connection status and notify subscribers
	 */
	private setConnectionStatus(status: ConnectionStatus): void {
		this.connectionStatus = status;
		this.statusSubscribers.forEach((callback) => callback(status));
	}

	/**
	 * Get current connection status
	 */
	public getConnectionStatus(): ConnectionStatus {
		return this.connectionStatus;
	}

	/**
	 * Subscribe to connection status changes
	 */
	public onStatusChange(callback: (status: ConnectionStatus) => void): () => void {
		this.statusSubscribers.push(callback);
		return () => {
			this.statusSubscribers = this.statusSubscribers.filter((cb) => cb !== callback);
		};
	}

	public disconnect(): void {
		if (this.ws) {
			console.log("BackendService: Disconnecting WebSocket.");
			this.ws.close();
			this.ws = null;
		}
		this.setConnectionStatus(ConnectionStatus.DISCONNECTED);
	}

	public sendFrame(frameData: FrameData): void {
		if (this.ws && this.ws.readyState === WebSocket.OPEN) {
			try {
				this.ws.send(JSON.stringify({ type: "frame", data: frameData }));
			} catch (error) {
				console.error("BackendService: Error sending frame:", error);
				this.handleError(error instanceof Error ? error : new Error(String(error)));
			}
		} else {
			console.warn("BackendService: WebSocket not connected. Cannot send frame.");
			this.handleError(new Error("WebSocket not connected. Cannot send frame."));
		}
	}

	public sendMessage(type: string, data: Record<string, any>): void {
		if (this.ws && this.ws.readyState === WebSocket.OPEN) {
			try {
				this.ws.send(JSON.stringify({ type, data }));
			} catch (error) {
				console.error(`BackendService: Error sending message of type ${type}:`, error);
				this.handleError(error instanceof Error ? error : new Error(String(error)));
			}
		} else {
			console.warn(
				`BackendService: WebSocket not connected. Cannot send message of type ${type}.`
			);
			this.handleError(new Error("WebSocket not connected. Cannot send message."));
		}
	}

	private handleError(error: Error): void {
		this.errorSubscribers.forEach((cb) => cb(error));
	}

	public onEvent(callback: EventCallback): () => void {
		this.eventSubscribers.push(callback);
		return () => {
			this.eventSubscribers = this.eventSubscribers.filter((cb) => cb !== callback);
		};
	}

	public onError(callback: ErrorCallback): () => void {
		this.errorSubscribers.push(callback);
		return () => {
			this.errorSubscribers = this.errorSubscribers.filter((cb) => cb !== callback);
		};
	}

	public onClose(callback: CloseCallback): () => void {
		this.closeSubscribers.push(callback);
		return () => {
			this.closeSubscribers = this.closeSubscribers.filter((cb) => cb !== callback);
		};
	}

	public onOpen(callback: OpenCallback): () => void {
		this.openSubscribers.push(callback);
		return () => {
			this.openSubscribers = this.openSubscribers.filter((cb) => cb !== callback);
		};
	}

	public getReadyState(): number | undefined {
		return this.ws?.readyState;
	}

	private isValidBackendEvent(data: any): data is BackendEvent {
		console.log("Validating received event:", JSON.stringify(data, null, 2));

		const isValid =
			typeof data === "object" &&
			data !== null &&
			typeof data.id === "string" &&
			typeof data.type === "string" &&
			typeof data.timestamp === "string";

		if (!isValid) {
			console.warn("Event validation failed. Missing or invalid properties:");
			if (typeof data !== "object" || data === null) {
				console.warn("- data is not an object or is null");
			} else {
				if (typeof data.id !== "string")
					console.warn("- id is not a string:", typeof data.id);
				if (typeof data.type !== "string")
					console.warn("- type is not a string:", typeof data.type);
				if (typeof data.timestamp !== "string")
					console.warn("- timestamp is not a string:", typeof data.timestamp);
			}
		}

		return isValid;
	}
}
