import { Tabs } from "expo-router";
import { useColorScheme } from "react-native";
import { HapticTab } from "@/components/HapticTab";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";

/**
 * Defines the tab layout for the main app screens
 */
export default function TabLayout() {
	return (
		<Tabs
			screenOptions={{
				tabBarActiveTintColor: Colors.honey.primary,
				tabBarInactiveTintColor: Colors.earth.primary,
				tabBarStyle: {
					backgroundColor: "#fff",
					borderTopColor: "#eee",
				},
				headerShown: false,
			}}>
			<Tabs.Screen
				name="index"
				options={{
					title: "Home",
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="home" color={color} size={size} />
					),
					tabBarButton: (props) => <HapticTab {...props} />,
				}}
			/>
			<Tabs.Screen
				name="logs"
				options={{
					title: "Logs",
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="analytics" color={color} size={size} />
					),
					tabBarButton: (props) => <HapticTab {...props} />,
				}}
			/>
			<Tabs.Screen
				name="news"
				options={{
					title: "News",
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="newspaper" color={color} size={size} />
					),
					tabBarButton: (props) => <HapticTab {...props} />,
				}}
			/>
		</Tabs>
	);
}
