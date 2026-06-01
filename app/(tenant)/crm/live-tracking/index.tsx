import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";

import {
  useEffect,
  useState,
} from "react";

import MapView, {
  Marker,
} from "react-native-maps";

import { useRouter } from "expo-router";

import RoleGuard from "@/src/guards/RoleGuard";

import { trackingService } from "@/src/services/trackingService";

import {
  initSocket,
} from "@/src/socket";

export default function LiveTrackingScreen() {

  const router = useRouter();

  const [mrs, setMrs] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);

  /* =========================
     LOAD INITIAL DATA
  ========================= */

  const loadInitial =
    async () => {

      try {

        setLoading(true);

        const data =
          await trackingService.getLiveMRLocations();

        console.log(
          "LIVE TRACK DATA:",
          data
        );

        if (Array.isArray(data)) {
          setMrs(data);
        } else if (
          Array.isArray(data?.locations)
        ) {
          setMrs(data.locations);
        } else {
          setMrs([]);
        }

      } catch (err: any) {

        console.log(
          "LIVE TRACK ERROR:",
          err?.response?.data || err
        );

      } finally {

        setLoading(false);
      }
    };

  /* =========================
     SOCKET
  ========================= */

  useEffect(() => {

    loadInitial();

    const socket =
      initSocket();

    socket.on(
      "mr-location-update",
      (data: any) => {

        if (!data?.userId) {
          return;
        }

        setMrs((prev) => {

          const filtered =
            prev.filter(
              (m) =>
                m.userId !==
                data.userId
            );

          return [
            {
              ...data,
              updatedAt:
                new Date().toISOString(),
            },
            ...filtered,
          ];
        });
      }
    );

    return () => {

      socket.off(
        "mr-location-update"
      );
    };

  }, []);

  if (loading) {

    return (
      <View style={styles.loader}>
        <ActivityIndicator
          size="large"
          color="#2563eb"
        />
      </View>
    );
  }

  const first =
    mrs?.[0];

  return (

    <RoleGuard
      allowedRoles={[
        "admin",
        "manager",
      ]}
    >

      <View style={{ flex: 1 }}>

        <MapView
          style={{ flex: 1 }}
          initialRegion={{
            latitude:
              first?.latitude ||
              first?.lat ||
              20.5937,

            longitude:
              first?.longitude ||
              first?.lng ||
              78.9629,

            latitudeDelta: 2,
            longitudeDelta: 2,
          }}
        >

          {mrs.map((mr, i) => (

            <Marker
              key={
                mr.userId || i
              }
              coordinate={{
                latitude:
                  mr.latitude ||
                  mr.lat,

                longitude:
                  mr.longitude ||
                  mr.lng,
              }}
              title={
                mr.name ||
                mr.userId
              }
            />
          ))}
        </MapView>

        <View
          style={
            styles.bottomSheet
          }
        >

          <Text style={styles.title}>
            Live MR Tracking
          </Text>

          <FlatList
            data={mrs}
            keyExtractor={(
              item,
              i
            ) =>
              item.userId ||
              i.toString()
            }
            renderItem={({
              item,
            }) => (

              <TouchableOpacity
                style={
                  styles.card
                }
                onPress={() =>
                  router.push(
                    `/crm/live-tracking/${item.userId}` as any
                  )
                }
              >

                <Text
                  style={
                    styles.name
                  }
                >
                  {item.name ||
                    item.userId}
                </Text>

                <Text>
                  Lat:
                  {" "}
                  {item.latitude ||
                    item.lat}
                </Text>

                <Text>
                  Lng:
                  {" "}
                  {item.longitude ||
                    item.lng}
                </Text>

                <Text
                  style={
                    styles.routeBtn
                  }
                >
                  View Route →
                </Text>

              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </RoleGuard>
  );
}

const styles =
  StyleSheet.create({

    loader: {
      flex: 1,
      justifyContent:
        "center",
      alignItems:
        "center",
    },

    bottomSheet: {
      position:
        "absolute",
      bottom: 0,
      width: "100%",
      maxHeight: 320,
      backgroundColor:
        "#fff",
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 12,
    },

    title: {
      fontSize: 18,
      fontWeight: "700",
      marginBottom: 10,
    },

    card: {
      padding: 12,
      borderBottomWidth: 1,
      borderColor: "#eee",
    },

    name: {
      fontWeight: "700",
      marginBottom: 4,
    },

    routeBtn: {
      marginTop: 6,
      color: "#2563eb",
      fontWeight: "700",
    },
  });