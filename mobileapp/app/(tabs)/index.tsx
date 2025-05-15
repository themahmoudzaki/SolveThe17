import {
	StyleSheet,
	View,
	TouchableOpacity,
	Alert,
	SafeAreaView,
	Animated,
	StatusBar,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useState, useEffect, useRef, useCallback } from "react";
import { router, usePathname, useNavigation } from "expo-router";
import { useBackendService } from "@/contexts/BackendServiceContext";
import Colors from "@/constants/Colors";

export default function HomeScreen() {
	const [permission, requestPermission] = useCameraPermissions();
	const [isStreaming, setIsStreaming] = useState(false);
	const [showCamera, setShowCamera] = useState(true);
	const [frameCount, setFrameCount] = useState(0);
	const cameraRef = useRef<any>(null);
	const streamingInterval = useRef<ReturnType<typeof setInterval> | null>(null);
	const { isConnected, sendFrame, error } = useBackendService();
	const pathname = usePathname();
	const navigation = useNavigation();

	// Animation for the recording indicator
	const pulseAnim = useRef(new Animated.Value(1)).current;

	const handleStopStreaming = useCallback(() => {
		if (streamingInterval.current) {
			clearInterval(streamingInterval.current);
			streamingInterval.current = null;
		}
		setIsStreaming(false);
	}, []);

	// Setup pulse animation when streaming
	useEffect(() => {
		if (isStreaming) {
			Animated.loop(
				Animated.sequence([
					Animated.timing(pulseAnim, {
						toValue: 0.4,
						duration: 1000,
						useNativeDriver: true,
					}),
					Animated.timing(pulseAnim, {
						toValue: 1,
						duration: 1000,
						useNativeDriver: true,
					}),
				])
			).start();
		} else {
			pulseAnim.setValue(1);
			setFrameCount(0);
		}
	}, [isStreaming, pulseAnim]);

	// Request camera permission on mount
	useEffect(() => {
		if (!permission) {
			requestPermission();
		}
	}, [permission, requestPermission]);

	// Handle stopping the stream when navigating away
	useEffect(() => {
		// Add navigation listener to detect when user navigates away
		const unsubscribe = navigation.addListener("beforeRemove", (e) => {
			// If we're streaming, stop it before navigation
			if (isStreaming) {
				console.log("Navigation detected, stopping stream before navigating away");
				handleStopStreaming();
			}
		});

		return unsubscribe;
	}, [navigation, isStreaming, handleStopStreaming]);

	// Handle tab switching
	useEffect(() => {
		const isHomeTab =
			pathname === "/" ||
			pathname === "/index" ||
			pathname === "/(tabs)" ||
			pathname === "/(tabs)/index";

		if (!isHomeTab) {
			// Clean up and hide camera when leaving tab
			if (streamingInterval.current) {
				clearInterval(streamingInterval.current);
				streamingInterval.current = null;
			}
			setIsStreaming(false);
			setShowCamera(false);
		} else {
			// Show camera when returning to tab
			setShowCamera(true);
		}

		return () => {
			if (streamingInterval.current) {
				clearInterval(streamingInterval.current);
				streamingInterval.current = null;
			}
		};
	}, [pathname]);

	// Show error alerts
	useEffect(() => {
		if (error) {
			console.error("Backend error:", error);
			Alert.alert("Error", error.message);
		}
	}, [error]);

	const captureAndSendFrame = useCallback(async () => {
		if (!cameraRef.current || !isConnected) {
			console.warn("Cannot capture frame:", {
				hasCamera: !!cameraRef.current,
				isConnected,
			});
			return;
		}

		try {
			const photo = await cameraRef.current.takePictureAsync({
				quality: 0.1,
				base64: true,
				skipProcessing: true,
				exif: false,
				imageType: "jpg",
				shutterSound: false,
			});

			if (!photo || !photo.base64) {
				console.warn("No photo data available");
				return;
			}

			// Simply send the base64 string
			sendFrame({
				timestamp: Date.now(),
				frame: photo.base64,
				deviceId: "expo-app-1",
			});

			// Increment frame count
			setFrameCount((count) => count + 1);
		} catch (error) {
			console.error("Error capturing or sending frame:", error);
			if (isStreaming) {
				handleStopStreaming();
				Alert.alert("Error", "Failed to capture or send frame. Streaming stopped.");
			}
		}
	}, [isConnected, isStreaming, sendFrame, handleStopStreaming]);

	const handleStartStreaming = useCallback(() => {
		if (!cameraRef.current) {
			Alert.alert("Error", "Camera not initialized");
			return;
		}

		if (!isConnected) {
			Alert.alert("Not Connected", "Please ensure connection to backend before streaming");
			return;
		}

		try {
			setIsStreaming(true);
			setFrameCount(0);
			streamingInterval.current = setInterval(captureAndSendFrame, 500);
		} catch (error) {
			console.error("Error starting streaming:", error);
			Alert.alert("Error", "Failed to start streaming");
			setIsStreaming(false);
		}
	}, [isConnected, captureAndSendFrame]);

	// Enhanced navigation handlers to ensure streaming stops before navigation
	const navigateToLogs = useCallback(() => {
		if (isStreaming) {
			handleStopStreaming();
		}
		router.push("/(tabs)/logs");
	}, [isStreaming, handleStopStreaming]);

	const navigateToNews = useCallback(() => {
		if (isStreaming) {
			handleStopStreaming();
		}
		router.push("/(tabs)/news");
	}, [isStreaming, handleStopStreaming]);

	const navigateToSettings = useCallback(() => {
		if (isStreaming) {
			handleStopStreaming();
		}
		// Future settings screen navigation
	}, [isStreaming, handleStopStreaming]);

	if (!permission) {
		return (
			<ThemedView style={styles.container}>
				<ThemedText>Requesting camera permission...</ThemedText>
			</ThemedView>
		);
	}

	if (!permission.granted) {
		return (
			<ThemedView style={styles.container}>
				<ThemedText style={styles.permissionText}>No access to camera</ThemedText>
				<TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
					<ThemedText style={styles.permissionButtonText}>Grant Permission</ThemedText>
				</TouchableOpacity>
			</ThemedView>
		);
	}

	return (
		<SafeAreaView style={styles.container}>
			<StatusBar barStyle="light-content" backgroundColor="#000" />
			<ThemedView style={styles.container}>
				{/* Camera View - Full height */}
				<View style={styles.cameraContainer}>
					{showCamera ? (
						<CameraView
							ref={cameraRef}
							style={styles.cameraPreview}
							facing="back"
							animateShutter={false}
						/>
					) : (
						<View style={[styles.cameraPreview, { backgroundColor: "#000" }]} />
					)}

					{/* Header Overlay */}
					<View style={styles.headerOverlay}>
						<ThemedText type="title" style={styles.titleText}>
							Jager ADS
						</ThemedText>
						<View style={styles.headerRight}>
							{!isConnected && (
								<View style={styles.connectionStatus}>
									<Ionicons name="warning" size={14} color="#FFF" />
									<ThemedText style={styles.connectionText}>Offline</ThemedText>
								</View>
							)}
						</View>
					</View>

					{/* Streaming Indicator Overlay */}
					{isStreaming && (
						<View style={styles.streamingOverlay}>
							<View style={styles.streamingInfo}>
								<Animated.View
									style={[styles.recordingIndicator, { opacity: pulseAnim }]}
								/>
								<ThemedText style={styles.streamingText}>
									LIVE: {frameCount} frames
								</ThemedText>
							</View>
						</View>
					)}

					{/* Bottom Controls Overlay */}
					<View style={styles.controlsOverlay}>
						<View style={styles.controlsContainer}>
							{/* Stream Control Button */}
							<TouchableOpacity
								style={[
									styles.recordButton,
									isStreaming && styles.recordButtonActive,
									(!isConnected || !showCamera) && styles.recordButtonDisabled,
								]}
								onPress={isStreaming ? handleStopStreaming : handleStartStreaming}
								disabled={!isConnected || !showCamera}>
								<Ionicons
									name={isStreaming ? "stop" : "play"}
									size={32}
									color="white"
								/>
							</TouchableOpacity>

							{/* Status Text */}
							<ThemedText style={styles.statusText}>
								{isStreaming ? "Stop Streaming" : "Start Streaming"}
							</ThemedText>
						</View>

						{/* Quick Action Buttons */}
						<View style={styles.quickActionButtons}>
							<TouchableOpacity
								style={styles.quickActionButton}
								onPress={navigateToLogs}>
								<Ionicons name="analytics" size={20} color="#FFF" />
							</TouchableOpacity>

							<TouchableOpacity
								style={styles.quickActionButton}
								onPress={navigateToNews}>
								<Ionicons name="newspaper" size={20} color="#FFF" />
							</TouchableOpacity>

							<TouchableOpacity
								style={styles.quickActionButton}
								onPress={navigateToSettings}>
								<Ionicons name="settings" size={20} color="#FFF" />
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</ThemedView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#000",
	},
	cameraContainer: {
		flex: 1,
		position: "relative",
	},
	cameraPreview: {
		flex: 1,
	},
	headerOverlay: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: 20,
		paddingTop: 16,
		paddingBottom: 12,
		backgroundColor: "rgba(0,0,0,0.4)",
	},
	headerRight: {
		flexDirection: "row",
		alignItems: "center",
	},
	connectionStatus: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "rgba(255, 59, 48, 0.8)",
		paddingHorizontal: 10,
		paddingVertical: 4,
		borderRadius: 16,
	},
	connectionText: {
		color: "#FFF",
		fontSize: 12,
		fontWeight: "600",
		marginLeft: 4,
	},
	titleText: {
		color: "#FFF",
		fontSize: 20,
		fontWeight: "bold",
	},
	streamingOverlay: {
		position: "absolute",
		top: 70,
		left: 20,
	},
	streamingInfo: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "rgba(0,0,0,0.6)",
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 20,
	},
	recordingIndicator: {
		width: 12,
		height: 12,
		borderRadius: 6,
		backgroundColor: "#FF3B30",
		marginRight: 8,
	},
	streamingText: {
		color: "white",
		fontSize: 14,
		fontWeight: "600",
	},
	controlsOverlay: {
		position: "absolute",
		bottom: 0,
		left: 0,
		right: 0,
		paddingBottom: 40,
		paddingTop: 20,
		backgroundColor: "rgba(0,0,0,0.6)",
	},
	controlsContainer: {
		alignItems: "center",
		marginBottom: 20,
	},
	recordButton: {
		width: 70,
		height: 70,
		borderRadius: 35,
		backgroundColor: Colors.honey.primary,
		justifyContent: "center",
		alignItems: "center",
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 3,
		},
		shadowOpacity: 0.4,
		shadowRadius: 5,
		elevation: 8,
		marginBottom: 10,
	},
	recordButtonActive: {
		backgroundColor: "#FF3B30",
	},
	recordButtonDisabled: {
		backgroundColor: "#666",
		opacity: 0.7,
	},
	statusText: {
		color: "#FFF",
		fontSize: 14,
	},
	quickActionButtons: {
		flexDirection: "row",
		justifyContent: "center",
		gap: 24,
	},
	quickActionButton: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: "rgba(255,255,255,0.2)",
		justifyContent: "center",
		alignItems: "center",
	},
	permissionText: {
		color: "#FFF",
		fontSize: 18,
		marginBottom: 20,
		textAlign: "center",
	},
	permissionButton: {
		backgroundColor: Colors.honey.primary,
		paddingHorizontal: 24,
		paddingVertical: 16,
		borderRadius: 8,
	},
	permissionButtonText: {
		color: "white",
		textAlign: "center",
		fontWeight: "bold",
		fontSize: 16,
	},
});
