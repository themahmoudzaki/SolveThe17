import { Text, TextProps } from "react-native";
import { StyleSheet } from "react-native";
import Colors from "@/constants/Colors";
import { TEXT_STYLES } from "@/constants/Styles";

export type ThemedTextProps = TextProps & {
	color?: string;
	type?: "default" | "title" | "subtitle" | "body" | "caption" | "small" | "link";
};

/**
 * A text component that applies consistent text styling using centralized text styles
 */
export function ThemedText({ style, color, type = "default", ...rest }: ThemedTextProps) {
	const textColor = color || Colors.text.primary;

	return (
		<Text
			style={[
				{ color: textColor },
				type === "default" ? styles.default : undefined,
				type === "title" ? TEXT_STYLES.title : undefined,
				type === "subtitle" ? TEXT_STYLES.subtitle : undefined,
				type === "body" ? TEXT_STYLES.body : undefined,
				type === "caption" ? TEXT_STYLES.caption : undefined,
				type === "small" ? TEXT_STYLES.small : undefined,
				type === "link" ? styles.link : undefined,
				style,
			]}
			{...rest}
		/>
	);
}

const styles = StyleSheet.create({
	default: {
		fontSize: 16,
		lineHeight: 24,
	},
	link: {
		lineHeight: 22,
		fontSize: 16,
		color: Colors.honey.primary,
		textDecorationLine: "underline",
	},
});
