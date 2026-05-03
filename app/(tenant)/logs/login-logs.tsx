import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { useEffect, useState } from "react";
import { api } from "@/src/api/api";
import { Ionicons } from "@expo/vector-icons";

export default function LoginLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const fetchLogs = async (pageNumber = 1) => {
    try {
      setLoading(true);
      const res = await api.get(`/login-logs?page=${pageNumber}&limit=10`);
      setLogs(res.data.data);
      setPages(res.data.pages);
      setPage(pageNumber);
    } catch (err) {
      console.log("Failed to fetch logs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1);
  }, []);

  const renderItem = ({ item }: any) => (
    <View
      style={{
        backgroundColor: "#fff",
        padding: 12,
        marginBottom: 10,
        borderRadius: 8,
        elevation: 2,
      }}
    >
      <Text style={{ fontWeight: "bold" }}>
        {item.userId?.name || "Unknown User"}
      </Text>

      <Text>Role: {item.userId?.role}</Text>
      <Text>Status: {item.status}</Text>
      <Text>IP: {item.ipAddress || "N/A"}</Text>
      <Text>
        Time: {new Date(item.createdAt).toLocaleString()}
      </Text>
    </View>
  );

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 15 }}>
        Login Logs
      </Text>

      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <>
          <FlatList
            data={logs}
            keyExtractor={(item) => item._id}
            renderItem={renderItem}
          />

          {/* Pagination */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: 15,
            }}
          >
            <TouchableOpacity
              disabled={page === 1}
              onPress={() => fetchLogs(page - 1)}
            >
              <Ionicons name="arrow-back-circle" size={28} />
            </TouchableOpacity>

            <Text>
              Page {page} of {pages}
            </Text>

            <TouchableOpacity
              disabled={page === pages}
              onPress={() => fetchLogs(page + 1)}
            >
              <Ionicons name="arrow-forward-circle" size={28} />
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}
