import { StyleSheet, View, ViewProps } from "react-native";
import Colors from "@/constants/Colors";

export type ThemedViewProps = ViewProps & {
	backgroundColor?: string;
};

export function ThemedView({ style, backgroundColor, ...otherProps }: ThemedViewProps) {
	const bgColor = backgroundColor || Colors.background.default;

	return <View style={[{ backgroundColor: bgColor }, style]} {...otherProps} />;
}
