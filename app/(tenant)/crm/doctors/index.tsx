import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Linking,
} from "react-native";

import { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import * as Location from "expo-location";

import { api } from "@/src/api/api";
import ActionMenu from "@/src/components/common/ActionMenu";

export default function DoctorsScreen() {

  const [doctors, setDoctors] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");

  const [total, setTotal] = useState(0);

  const [page, setPage] = useState(1);

  const [hasMore, setHasMore] = useState(true);

  const [fetchingMore, setFetchingMore] =
    useState(false);

  const [openMenuId, setOpenMenuId] =
    useState<string | null>(null);

  const [location, setLocation] =
    useState<any>(null);

  /* ================= LOCATION ================= */
  const getLocation = async () => {
    try {

      const { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        return;
      }

      const loc =
        await Location.getCurrentPositionAsync({});

      setLocation(loc.coords);

    } catch (err) {
      console.log("LOCATION ERROR:", err);
    }
  };

  /* ================= FETCH DOCTORS ================= */
  const fetchDoctors = async (
    reset = false
  ) => {

    try {

      if (reset) {
        setLoading(true);
      }

      const safePage =
        reset ? 1 : page;

      console.log("DOCTOR API:", {
        safePage,
        search,
      });

      const res = await api.get(
        `/doctors?search=${search}&page=${safePage}&limit=10`
      );

      const newDoctors =
        (res.data.doctors || []).sort(
          (a: any, b: any) =>
            new Date(
              b.createdAt
            ).getTime() -
            new Date(
              a.createdAt
            ).getTime()
        );

      setTotal(res.data.total || 0);

      /* ================= RESET ================= */
      if (reset) {

        setDoctors(newDoctors);

        setPage(1);

      } else {

        setDoctors((prev) => {

          const map = new Map();

          [...prev, ...newDoctors].forEach(
            (d) => {
              map.set(d._id, d);
            }
          );

          return Array.from(
            map.values()
          );
        });
      }

      /* ================= STOP LOOP ================= */
      setHasMore(
        newDoctors.length === 10
      );

    } catch (err: any) {

      console.log(
        "DOCTOR FETCH ERROR:",
        err?.response?.data || err
      );

      /* ================= STOP LOOP ON ERROR ================= */
      setHasMore(false);

      /* ================= CLEAR BAD PAGINATION ================= */
      if (page > 1) {
        setPage(1);
      }

    } finally {

      setLoading(false);

      setFetchingMore(false);
    }
  };

  /* ================= EFFECTS ================= */
  useEffect(() => {

    getLocation();

    const delay = setTimeout(() => {
      fetchDoctors(true);
    }, 400);

    return () => clearTimeout(delay);

  }, [search]);

  useEffect(() => {

    if (
      page > 1 &&
      hasMore
    ) {
      fetchDoctors();
    }

  }, [page]);

  /* ================= ACTIONS ================= */
  const openMap = (
    lat: number,
    lng: number
  ) => {

    const url =
      `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

    Linking.openURL(url);
  };

  const startVisit = async (
    doctorId: string
  ) => {

    try {

      if (!location) {
        return Alert.alert(
          "Error",
          "Location not available"
        );
      }

      await api.post(
        "/visits/start",
        {
          doctorId,
          lat: location.latitude,
          lng: location.longitude,
        }
      );

      Alert.alert(
        "Success",
        "Visit started"
      );

    } catch (err: any) {

      Alert.alert(
        "Error",
        err?.response?.data?.message ||
          "Failed to start visit"
      );
    }
  };

  const endVisit = async (
    visitId: string
  ) => {

    try {

      if (!location) {
        return Alert.alert(
          "Error",
          "Location not available"
        );
      }

      await api.post(
        "/visits/end",
        {
          visitId,
          notes: "Visited",
          lat: location.latitude,
          lng: location.longitude,
        }
      );

      Alert.alert(
        "Success",
        "Visit completed"
      );

    } catch (err: any) {

      Alert.alert(
        "Error",
        err?.response?.data?.message ||
          "Failed to end visit"
      );
    }
  };

  /* ================= RENDER ITEM ================= */
  const renderItem = ({
    item,
  }: any) => (
    <View style={styles.tableRow}>

      <Text
        style={[
          styles.cell,
          { flex: 2 },
        ]}
      >
        {item.firstName}{" "}
        {item.lastName}
      </Text>

      <Text
        style={[
          styles.cell,
          { flex: 2 },
        ]}
      >
        {item.mobile}
      </Text>

      <Text
        style={[
          styles.cell,
          { flex: 2 },
        ]}
      >
        {item.specialization ||
          "N/A"}
      </Text>

      <View
        style={{
          flex: 1,
          alignItems: "flex-end",
        }}
      >

        <ActionMenu
          isOpen={
            openMenuId === item._id
          }

          onToggle={() =>
            setOpenMenuId(
              openMenuId === item._id
                ? null
                : item._id
            )
          }

          actions={[
            {
              label: "Call",

              onPress: () =>
                Linking.openURL(
                  `tel:${item.mobile}`
                ),

              color: "#059669",
            },

            {
              label: "Navigate",

              onPress: () =>
                openMap(
                  item.latitude,
                  item.longitude
                ),

              color: "#0ea5e9",
            },

            {
              label: "Start Visit",

              onPress: () =>
                startVisit(
                  item._id
                ),

              color: "#2563eb",
            },

            {
              label: "End Visit",

              onPress: () =>
                endVisit(
                  item.visitId
                ),

              show:
                !!item.visitId,

              color: "#f59e0b",
            },
          ]}
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView
      style={styles.container}
    >

      {/* HEADER */}
      <View style={styles.header}>
        <Text
          style={styles.headerTitle}
        >
          Doctors
        </Text>
      </View>

      {/* COUNT */}
      <View style={styles.countRow}>
        <Text>
          Total: {total}
        </Text>
      </View>

      {/* SEARCH */}
      <View
        style={
          styles.searchContainer
        }
      >

        <Ionicons
          name="search"
          size={18}
          color="#666"
        />

        <TextInput
          placeholder="Search doctor"
          value={search}

          onChangeText={(
            text
          ) => {
            setSearch(text);
            setPage(1);
          }}

          style={
            styles.searchInput
          }
        />
      </View>

      {/* TABLE */}
      <FlatList
        data={doctors}

        keyExtractor={(item) =>
          item._id
        }

        renderItem={renderItem}

        stickyHeaderIndices={[0]}

        ListHeaderComponent={
          <View
            style={
              styles.tableHeader
            }
          >

            <Text
              style={[
                styles.headerCell,
                { flex: 2 },
              ]}
            >
              Name
            </Text>

            <Text
              style={[
                styles.headerCell,
                { flex: 2 },
              ]}
            >
              Mobile
            </Text>

            <Text
              style={[
                styles.headerCell,
                { flex: 2 },
              ]}
            >
              Specialization
            </Text>
          </View>
        }

        ListEmptyComponent={
          !loading ? (
            <View
              style={{
                padding: 40,
                alignItems:
                  "center",
              }}
            >
              <Text>
                No doctors found
              </Text>
            </View>
          ) : null
        }

        onEndReached={() => {

          if (
            !hasMore ||
            loading ||
            fetchingMore
          ) {
            return;
          }

          setFetchingMore(true);

          setPage(
            (prev) => prev + 1
          );
        }}

        onEndReachedThreshold={
          0.5
        }

        ListFooterComponent={
          fetchingMore ? (
            <ActivityIndicator
              style={{
                margin: 20,
              }}
            />
          ) : null
        }
      />
    </SafeAreaView>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor:
      "#f5f7fb",
  },

  header: {
    backgroundColor:
      "#1f5f8b",
    padding: 15,
  },

  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },

  countRow: {
    flexDirection: "row",
    justifyContent:
      "space-between",
    padding: 10,
  },

  searchContainer: {
    margin: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor:
      "#fff",
    borderRadius: 25,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#ddd",
  },

  searchInput: {
    marginLeft: 10,
    flex: 1,
    height: 45,
  },

  tableHeader: {
    flexDirection: "row",
    backgroundColor:
      "#1f5f8b",
    padding: 10,
  },

  headerCell: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },

  tableRow: {
    flexDirection: "row",
    backgroundColor:
      "#fff",
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#eee",
    alignItems: "center",
  },

  cell: {
    fontSize: 12,
  },
});