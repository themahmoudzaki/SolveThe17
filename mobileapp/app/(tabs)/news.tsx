import { useState, useEffect } from "react";
import {
	StyleSheet,
	View,
	FlatList,
	TouchableOpacity,
	ActivityIndicator,
	RefreshControl,
	SafeAreaView,
	Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useBackendService } from "@/contexts/BackendServiceContext";
import Colors from "@/constants/Colors";

// News article type
interface NewsArticle {
	id: string;
	title: string;
	summary: string;
	date: string;
	author: string;
	imageUrl: string;
	content: string;
}

export default function NewsScreen() {
	const [news, setNews] = useState<NewsArticle[]>([]);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const { isConnected, fetchNews } = useBackendService();

	const loadNews = async () => {
		setLoading(true);
		try {
			const newsData = await fetchNews();
			console.log("Fetched news articles:", newsData);
			setNews(newsData);
		} catch (error) {
			console.error("Error fetching news:", error);
		} finally {
			setLoading(false);
			setRefreshing(false);
		}
	};

	useEffect(() => {
		loadNews();
	}, []);

	const onRefresh = () => {
		setRefreshing(true);
		loadNews();
	};

	const renderNewsItem = ({ item }: { item: NewsArticle }) => {
		const formattedDate = new Date(item.date).toLocaleDateString(undefined, {
			year: "numeric",
			month: "long",
			day: "numeric",
		});

		return (
			<View style={styles.newsItem}>
				<Image
					source={{ uri: item.imageUrl }}
					style={styles.newsImage}
					resizeMode="cover"
				/>
				<View style={styles.newsContent}>
					<ThemedText style={styles.newsTitle}>{item.title}</ThemedText>
					<View style={styles.newsMetadata}>
						<ThemedText style={styles.newsAuthor}>{item.author}</ThemedText>
						<ThemedText style={styles.newsDate}>{formattedDate}</ThemedText>
					</View>
					<ThemedText style={styles.newsSummary}>{item.summary}</ThemedText>
					<ThemedText style={styles.newsBody}>{item.content}</ThemedText>
				</View>
			</View>
		);
	};

	return (
		<SafeAreaView style={styles.container}>
			<ThemedView style={styles.container}>
				<View style={styles.header}>
					<ThemedText type="title" style={styles.titleText}>
						Bee News
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
						<TouchableOpacity onPress={loadNews}>
							<Ionicons name="refresh" size={24} color={Colors.earth.dark} />
						</TouchableOpacity>
					</View>
				</View>

				{loading && !refreshing ? (
					<View style={styles.loadingContainer}>
						<ActivityIndicator size="large" color={Colors.honey.primary} />
						<ThemedText style={styles.loadingText}>Loading news...</ThemedText>
					</View>
				) : (
					<FlatList
						data={news}
						renderItem={renderNewsItem}
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
							<View style={styles.emptyContainer}>
								<Ionicons name="newspaper" size={48} color={Colors.earth.light} />
								<ThemedText style={styles.emptyText}>
									No news articles available
								</ThemedText>
							</View>
						}
					/>
				)}
			</ThemedView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
		backgroundColor: "#FFFFFF",
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 16,
	},
	headerRight: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
	titleText: {
		color: Colors.earth.dark,
		fontSize: 24,
		fontWeight: "bold",
	},
	statusIcon: {
		marginRight: 4,
	},
	list: {
		flex: 1,
	},
	listContent: {
		paddingBottom: 16,
	},
	newsItem: {
		backgroundColor: "white",
		borderRadius: 12,
		marginBottom: 16,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
		overflow: "hidden",
	},
	newsImage: {
		width: "100%",
		height: 200,
		backgroundColor: Colors.earth.light,
	},
	newsContent: {
		padding: 16,
	},
	newsTitle: {
		fontSize: 20,
		fontWeight: "bold",
		color: Colors.earth.dark,
		marginBottom: 8,
	},
	newsMetadata: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 12,
	},
	newsAuthor: {
		fontSize: 14,
		color: Colors.honey.dark,
		fontWeight: "600",
	},
	newsDate: {
		fontSize: 14,
		color: "#666",
	},
	newsSummary: {
		fontSize: 16,
		fontWeight: "600",
		marginBottom: 12,
		fontStyle: "italic",
		lineHeight: 22,
		color: "#444",
	},
	newsBody: {
		fontSize: 15,
		lineHeight: 24,
		color: "#333",
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	loadingText: {
		marginTop: 16,
		fontSize: 16,
		color: Colors.earth.dark,
	},
	emptyContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 32,
	},
	emptyText: {
		marginTop: 16,
		fontSize: 16,
		color: Colors.earth.dark,
		textAlign: "center",
	},
});
