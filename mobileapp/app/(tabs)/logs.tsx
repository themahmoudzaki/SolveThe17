import { useState } from "react";
import {
	StyleSheet,
	View,
	FlatList,
	TouchableOpacity,
	ActivityIndicator,
	RefreshControl,
	SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useBackendService } from "@/contexts/BackendServiceContext";
import { BackendEvent } from "@/types/backend";
import Colors from "@/constants/Colors";
import { LAYOUT_STYLES, TEXT_STYLES, CARD_STYLES } from "@/constants/Styles";
import { formatDateTime } from "@/utils/dateFormatters";
import { getEventSeverity } from "@/utils/eventHelpers";

// Properly type the Ionicons names
type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

type TabType = "events" | "insights";

export default function LogsScreen() {
	const [activeTab, setActiveTab] = useState<TabType>("events");
	const [refreshing, setRefreshing] = useState(false);

	// Use the global event and insight state from the context
	const { isConnected, events, insights, isLoading, refreshData } = useBackendService();

	// Handle refresh
	const onRefresh = async () => {
		setRefreshing(true);
		await refreshData();
		setRefreshing(false);
	};

	const getEventIcon = (type: BackendEvent["type"]): { name: IoniconName; color: string } => {
		const severity = type === "insight" ? "low" : getEventSeverity({ type } as BackendEvent);

		switch (type) {
			case "predator":
				return { name: "warning" as IoniconName, color: Colors.status.error };
			case "normal_activity":
				return { name: "information-circle" as IoniconName, color: Colors.honey.primary };
			case "system":
				return { name: "settings" as IoniconName, color: Colors.earth.dark };
			case "insight":
				return { name: "bulb" as IoniconName, color: Colors.honey.primary };
			default:
				return { name: "ellipse" as IoniconName, color: Colors.earth.primary };
		}
	};

	const renderEventItem = ({ item }: { item: BackendEvent }) => {
		const icon = getEventIcon(item.type);
		const formattedDate = formatDateTime(item.timestamp);
		const severity = getEventSeverity(item);

		return (
			<View
				style={[
					CARD_STYLES.card,
					styles.eventItem,
					severity === "critical" && styles.criticalEventItem,
					severity === "high" && styles.highEventItem,
				]}>
				<View style={styles.eventIconContainer}>
					<Ionicons name={icon.name} size={24} color={icon.color} />
				</View>
				<View style={styles.eventContent}>
					<ThemedText style={[CARD_STYLES.cardTitle, styles.eventMessage]}>
						{item.message}
					</ThemedText>
					<ThemedText style={[TEXT_STYLES.small, styles.eventTimestamp]}>
						{formattedDate}
					</ThemedText>
					{item.details && (
						<ThemedText style={[TEXT_STYLES.body, styles.eventDetails]}>
							{item.details}
						</ThemedText>
					)}
				</View>
			</View>
		);
	};

	const renderInsightItem = ({ item }: { item: any }) => {
		const formattedDate = formatDateTime(item.timestamp);

		return (
			<View style={[CARD_STYLES.card, styles.insightItem]}>
				<Ionicons name="bulb" size={24} color={Colors.honey.primary} />
				<View style={styles.insightContent}>
					<ThemedText style={[CARD_STYLES.cardTitle, styles.insightTitle]}>
						{item.title || item.message}
					</ThemedText>
					<ThemedText style={[TEXT_STYLES.small, styles.insightTimestamp]}>
						{formattedDate}
					</ThemedText>
					<ThemedText style={[TEXT_STYLES.body, styles.insightDescription]}>
						{item.description || item.details}
					</ThemedText>
				</View>
			</View>
		);
	};

	return (
		<SafeAreaView style={LAYOUT_STYLES.safeArea}>
			<ThemedView style={LAYOUT_STYLES.container}>
				<View style={[LAYOUT_STYLES.header, styles.header]}>
					<ThemedText type="title" style={TEXT_STYLES.title}>
						{activeTab === "insights" ? "AI Insights" : "Activity Logs"}
					</ThemedText>
					<View style={styles.headerRight}>
						{!isConnected && (
							<Ionicons
								name="warning"
								size={20}
								color={Colors.honey.dark}
								style={styles.statusIcon}
							/>
						)}
						<TouchableOpacity onPress={onRefresh}>
							<Ionicons name="refresh" size={24} color={Colors.earth.dark} />
						</TouchableOpacity>
					</View>
				</View>

				{/* Tab selector */}
				<View style={styles.tabs}>
					<TouchableOpacity
						style={[styles.tab, activeTab === "events" && styles.activeTab]}
						onPress={() => setActiveTab("events")}>
						<Ionicons
							name="list"
							size={20}
							color={
								activeTab === "events" ? Colors.honey.primary : Colors.earth.dark
							}
						/>
						<ThemedText
							style={[
								styles.tabText,
								activeTab === "events" && styles.activeTabText,
							]}>
							Events
						</ThemedText>
					</TouchableOpacity>
					<TouchableOpacity
						style={[styles.tab, activeTab === "insights" && styles.activeTab]}
						onPress={() => setActiveTab("insights")}>
						<Ionicons
							name="bulb"
							size={20}
							color={
								activeTab === "insights" ? Colors.honey.primary : Colors.earth.dark
							}
						/>
						<ThemedText
							style={[
								styles.tabText,
								activeTab === "insights" && styles.activeTabText,
							]}>
							AI Insights
						</ThemedText>
					</TouchableOpacity>
				</View>

				{isLoading && !refreshing ? (
					<View style={LAYOUT_STYLES.centeredContent}>
						<ActivityIndicator size="large" color={Colors.honey.primary} />
						<ThemedText style={styles.loadingText}>Loading data...</ThemedText>
					</View>
				) : (
					<>
						{activeTab === "events" ? (
							<FlatList
								data={events}
								renderItem={renderEventItem}
								keyExtractor={(item) => item.id}
								style={styles.list}
								contentContainerStyle={styles.listContent}
								refreshControl={
									<RefreshControl
										refreshing={refreshing}
										onRefresh={onRefresh}
										colors={[Colors.honey.primary]}
									/>
								}
								ListEmptyComponent={
									<View style={LAYOUT_STYLES.centeredContent}>
										<Ionicons
											name="document"
											size={48}
											color={Colors.earth.light}
										/>
										<ThemedText style={styles.emptyText}>
											No events recorded yet
										</ThemedText>
									</View>
								}
							/>
						) : (
							<FlatList
								data={insights}
								renderItem={renderInsightItem}
								keyExtractor={(item) => item.id}
								style={styles.list}
								contentContainerStyle={styles.listContent}
								refreshControl={
									<RefreshControl
										refreshing={refreshing}
										onRefresh={onRefresh}
										colors={[Colors.honey.primary]}
									/>
								}
								ListEmptyComponent={
									<View style={LAYOUT_STYLES.centeredContent}>
										<Ionicons
											name="bulb"
											size={48}
											color={Colors.earth.light}
										/>
										<ThemedText style={styles.emptyText}>
											No insights generated yet
										</ThemedText>
									</View>
								}
							/>
						)}
					</>
				)}
			</ThemedView>
		</SafeAreaView>
	);
}

// Styles specific to the Logs screen
const styles = StyleSheet.create({
	header: {
		borderBottomWidth: 0,
		paddingVertical: 16,
	},
	headerRight: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
	statusIcon: {
		marginRight: 4,
	},
	tabs: {
		flexDirection: "row",
		marginBottom: 16,
		marginHorizontal: 16,
		borderRadius: 8,
		overflow: "hidden",
		backgroundColor: Colors.earth.light,
	},
	tab: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 12,
		gap: 8,
	},
	activeTab: {
		backgroundColor: Colors.background.default,
		borderBottomWidth: 2,
		borderBottomColor: Colors.honey.primary,
	},
	tabText: {
		fontSize: 14,
		color: Colors.earth.dark,
	},
	activeTabText: {
		color: Colors.honey.primary,
		fontWeight: "bold",
	},
	list: {
		flex: 1,
	},
	listContent: {
		paddingHorizontal: 16,
		paddingBottom: 16,
	},
	eventItem: {
		flexDirection: "row",
		marginBottom: 8,
		paddingVertical: 12,
	},
	criticalEventItem: {
		borderLeftWidth: 4,
		borderLeftColor: Colors.status.error,
	},
	highEventItem: {
		borderLeftWidth: 4,
		borderLeftColor: Colors.status.warning,
	},
	eventIconContainer: {
		marginRight: 12,
	},
	eventContent: {
		flex: 1,
	},
	eventMessage: {
		marginBottom: 4,
	},
	eventTimestamp: {
		marginBottom: 8,
	},
	eventDetails: {
		fontSize: 14,
	},
	insightItem: {
		flexDirection: "row",
		borderLeftWidth: 4,
		borderLeftColor: Colors.honey.primary,
		marginBottom: 8,
	},
	insightContent: {
		flex: 1,
		marginLeft: 12,
	},
	insightTitle: {
		marginBottom: 6,
	},
	insightTimestamp: {
		marginBottom: 8,
	},
	insightDescription: {
		lineHeight: 22,
	},
	loadingText: {
		marginTop: 16,
		fontSize: 16,
		color: Colors.earth.dark,
	},
	emptyText: {
		marginTop: 16,
		fontSize: 16,
		color: Colors.earth.dark,
		textAlign: "center",
	},
});
