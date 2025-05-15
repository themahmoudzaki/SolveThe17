/**
 * Common style configurations for reuse across the app
 */
import { StyleSheet } from "react-native";
import Colors from "./Colors";

// Default fallback colors in case Colors object isn't fully available
const defaultColors = {
	textPrimary: "#333333",
	textSecondary: "#666666",
	textDefault: "#333333",
	textOnDark: "#FFFFFF",
	backgroundDefault: "#FFFFFF",
	shadow: "#000000",
	earthLight: "#EEE7DF",
	honeyPrimary: "#F6B93B",
	statusError: "#E74C3C",
};

// Safely get color values with fallbacks
const getColor = (colorPath: string, fallback: string): string => {
	try {
		const parts = colorPath.split(".");
		let current: any = Colors;
		for (const part of parts) {
			if (current === undefined || current[part] === undefined) {
				return fallback;
			}
			current = current[part];
		}
		return typeof current === "string" ? current : fallback;
	} catch (e) {
		console.warn(`Error accessing color: ${colorPath}`, e);
		return fallback;
	}
};

/**
 * Text styles for consistent typography
 */
export const TEXT_STYLES = StyleSheet.create({
	title: {
		fontSize: 24,
		fontWeight: "bold",
		color: getColor("text.primary", defaultColors.textPrimary),
		marginBottom: 10,
	},
	subtitle: {
		fontSize: 18,
		fontWeight: "600",
		color: getColor("text.primary", defaultColors.textPrimary),
		marginBottom: 8,
	},
	body: {
		fontSize: 16,
		color: getColor("text.default", defaultColors.textDefault),
		lineHeight: 22,
	},
	caption: {
		fontSize: 14,
		color: getColor("text.secondary", defaultColors.textSecondary),
	},
	small: {
		fontSize: 12,
		color: getColor("text.secondary", defaultColors.textSecondary),
	},
});

/**
 * Common layout styles
 */
export const LAYOUT_STYLES = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: getColor("background.default", defaultColors.backgroundDefault),
	},
	safeArea: {
		flex: 1,
		backgroundColor: getColor("background.default", defaultColors.backgroundDefault),
	},
	section: {
		padding: 16,
		marginBottom: 16,
	},
	row: {
		flexDirection: "row",
		alignItems: "center",
	},
	centeredContent: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: 20,
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: 16,
		paddingVertical: 12,
		borderBottomWidth: 1,
		borderBottomColor: getColor("earth.light", defaultColors.earthLight),
	},
});

/**
 * Common card styles
 */
export const CARD_STYLES = StyleSheet.create({
	card: {
		backgroundColor: getColor("background.default", defaultColors.backgroundDefault),
		borderRadius: 8,
		padding: 16,
		marginBottom: 12,
		shadowColor: getColor("shadow", defaultColors.shadow),
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	cardHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 12,
	},
	cardTitle: {
		fontSize: 16,
		fontWeight: "bold",
		color: getColor("text.primary", defaultColors.textPrimary),
	},
});
