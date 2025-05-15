import { useState, useEffect } from "react";
import {
	StyleSheet,
	View,
	TouchableOpacity,
	SafeAreaView,
	StatusBar,
	Animated,
	Easing,
	ActivityIndicator,
	Platform,
	ImageBackground,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { useBackendService } from "@/contexts/BackendServiceContext";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import * as Font from "expo-font";

// Import from centralized configs and utilities
import Colors from "@/constants/Colors";
import { APP_VERSION } from "@/constants/Config";
import { honeycombPattern } from "@/assets/patterns";

export default function LandingScreen() {
	const router = useRouter();
	const { isConnected, connectService } = useBackendService();
	const [connecting, setConnecting] = useState(false);
	const [fontsLoaded, setFontsLoaded] = useState(false);

	// Animated values for entrance animations
	const fadeAnim = useState(new Animated.Value(0))[0];
	const scaleAnim = useState(new Animated.Value(0.8))[0];
	const slideUpAnim = useState(new Animated.Value(50))[0];
	const honeycombOpacity = useState(new Animated.Value(0))[0];

	useEffect(() => {
		async function loadAssets() {
			try {
				if (Platform.OS === "ios" || Platform.OS === "android") {
					await Font.loadAsync({
						...Ionicons.font,
					});
				}
				// Add a small delay to ensure rendering is complete
				setTimeout(() => {
					setFontsLoaded(true);
				}, 300);
			} catch (error) {
				console.error("Error loading assets:", error);
				setFontsLoaded(true); // Continue anyway to avoid blocking the UI
			}
		}

		loadAssets();
	}, []);

	// Entrance animations - Only start after fonts are loaded
	useEffect(() => {
		if (!fontsLoaded) return;

		Animated.parallel([
			Animated.timing(fadeAnim, {
				toValue: 1,
				duration: 1000,
				easing: Easing.out(Easing.ease),
				useNativeDriver: true,
			}),
			Animated.timing(scaleAnim, {
				toValue: 1,
				duration: 1000,
				easing: Easing.elastic(1),
				useNativeDriver: true,
			}),
			Animated.timing(slideUpAnim, {
				toValue: 0,
				duration: 800,
				easing: Easing.out(Easing.quad),
				delay: 200,
				useNativeDriver: true,
			}),
			Animated.timing(honeycombOpacity, {
				toValue: 0.3,
				duration: 1500,
				delay: 500,
				useNativeDriver: true,
			}),
		]).start();
	}, [fadeAnim, scaleAnim, slideUpAnim, honeycombOpacity, fontsLoaded]);

	// Show a loading screen until fonts are ready
	if (!fontsLoaded) {
		return (
			<LinearGradient
				colors={Colors.gradients.primaryBackground as any}
				style={styles.container}>
				<StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
				<View style={styles.loadingContainer}>
					<ActivityIndicator size="large" color={Colors.gradients.primaryButton[0]} />
				</View>
			</LinearGradient>
		);
	}

	return (
		<LinearGradient colors={Colors.gradients.primaryBackground as any} style={styles.container}>
			<ImageBackground
				source={honeycombPattern}
				style={styles.imageBackground}
				imageStyle={styles.imageBackgroundPattern}>
				<StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
				<SafeAreaView style={styles.safeAreaContainer}>
					{/* Main Content */}
					<View style={styles.content}>
						<Animated.View
							style={[
								styles.logoContainer,
								{
									opacity: fadeAnim,
									transform: [{ scale: scaleAnim }],
								},
							]}>
							<View style={styles.logoCircle}>
								<Icon name="bee" size={90} color={Colors.text.primary} />
							</View>
							<ThemedText
								color={Colors.text.primary}
								style={[styles.appTitle, { lineHeight: 58 }]}>
								Jager ADS
							</ThemedText>
							<ThemedText style={styles.appSubtitle}>
								Advanced Hive Defense System
							</ThemedText>
						</Animated.View>

						<Animated.View
							style={[
								styles.statusContainer,
								{ opacity: fadeAnim, transform: [{ translateY: slideUpAnim }] },
							]}>
							<View style={styles.statusItem}>
								<Ionicons
									name={
										isConnected
											? "checkmark-circle"
											: connecting
											? "sync-circle"
											: "warning"
									}
									size={24}
									color={
										isConnected
											? Colors.status.success
											: connecting
											? Colors.status.info
											: Colors.status.warning
									}
								/>
								<ThemedText style={styles.statusText}>
									{connecting
										? "Connecting..."
										: isConnected
										? "Backend Connected"
										: "Backend Disconnected"}
								</ThemedText>
							</View>
						</Animated.View>

						<Animated.View
							style={{ opacity: fadeAnim, transform: [{ translateY: slideUpAnim }] }}>
							<TouchableOpacity
								style={styles.enterButtonTouchable}
								onPress={() => router.replace("/(tabs)")}
								activeOpacity={0.8}>
								<LinearGradient
									colors={Colors.gradients.primaryButton as any}
									style={styles.enterButtonGradient}
									start={{ x: 0, y: 0 }}
									end={{ x: 1, y: 1 }}>
									<ThemedText
										style={styles.enterButtonText}
										color={Colors.text.onDark}>
										ENTER SYSTEM
									</ThemedText>
									<Ionicons
										name="arrow-forward"
										size={22}
										color={Colors.text.onDark}
										style={{ marginLeft: 8 }}
									/>
								</LinearGradient>
							</TouchableOpacity>
						</Animated.View>
					</View>

					<Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
						<ThemedText style={styles.footerText}>
							© {APP_VERSION.COPYRIGHT_YEAR} {APP_VERSION.COMPANY_NAME}
						</ThemedText>
						<ThemedText style={styles.versionText}>v{APP_VERSION.VERSION}</ThemedText>
					</Animated.View>
				</SafeAreaView>
			</ImageBackground>
		</LinearGradient>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	safeAreaContainer: {
		flex: 1,
		backgroundColor: "transparent",
	},
	honeycombOverlay: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
	},
	imageBackground: {
		flex: 1,
	},
	imageBackgroundPattern: {
		resizeMode: "cover",
	},
	content: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: 24,
		paddingTop: 10,
	},
	logoContainer: {
		alignItems: "center",
		marginBottom: 30,
		paddingTop: 10,
	},
	logoCircle: {
		width: 140,
		height: 140,
		borderRadius: 70,
		backgroundColor: "rgba(246, 185, 59, 0.15)",
		justifyContent: "center",
		alignItems: "center",
		marginBottom: 20,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 6,
		},
		shadowOpacity: 0.2,
		shadowRadius: 8,
		elevation: 12,
	},
	appTitle: {
		fontSize: 48,
		fontWeight: "bold",
		// The color is applied via ThemedText
		textAlign: "center",
		marginBottom: 8,
		paddingVertical: 10,
		textShadowColor: "rgba(0, 0, 0, 0.25)",
		textShadowOffset: { width: 0, height: 2 },
		textShadowRadius: 3,
	},
	appSubtitle: {
		fontSize: 18,
		// The color is applied via ThemedText
		textAlign: "center",
		marginBottom: 30,
	},
	statusContainer: {
		marginBottom: 20,
		alignItems: "center",
	},
	statusItem: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "rgba(246, 185, 59, 0.2)",
		paddingHorizontal: 20,
		paddingVertical: 12,
		borderRadius: 25,
		minWidth: 240,
		justifyContent: "center",
	},
	statusText: {
		// The color is applied via ThemedText
		fontSize: 16,
		fontWeight: "500",
		marginLeft: 10,
	},
	enterButtonTouchable: {
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 4,
		},
		shadowOpacity: 0.3,
		shadowRadius: 5,
		elevation: 8,
		borderRadius: 30,
		marginTop: 0,
	},
	enterButtonGradient: {
		flexDirection: "row",
		paddingHorizontal: 30,
		paddingVertical: 18,
		borderRadius: 30,
		alignItems: "center",
		justifyContent: "center",
		minWidth: 250,
	},
	enterButtonText: {
		// The color is applied via ThemedText
		fontSize: 18,
		fontWeight: "bold",
	},
	footer: {
		padding: 24,
		alignItems: "center",
		borderTopWidth: 1,
		borderTopColor: "rgba(255, 255, 255, 0.1)",
		marginTop: 20,
	},
	footerText: {
		// The color is applied via ThemedText
		fontSize: 14,
	},
	versionText: {
		color: "rgba(255, 255, 255, 0.5)",
		fontSize: 12,
		marginTop: 4,
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
});
