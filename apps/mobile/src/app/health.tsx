import { api } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { HealthCheckResponse } from "@food-delivery/types";
import { Text, View, StyleSheet } from "react-native";
import { BrandLoader } from "@/components/ui/BrandLoader";

export default function HomeScreen() {
  const { data, isLoading, error } = useQuery<HealthCheckResponse>({
    queryKey: ["health"],
    queryFn: async () => {
      const response = await api.get<HealthCheckResponse>("/health");
      console.log("Health check response:", response.data);
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <View style={styles.container}>
        <BrandLoader label="Checking API…" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text>Error fetching health check data</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text>Health Check Status: {data?.status}</Text>
      <Text>Timestamp: {data?.timestamp}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
