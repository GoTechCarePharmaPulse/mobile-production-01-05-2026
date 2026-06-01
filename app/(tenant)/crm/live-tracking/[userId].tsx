import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";

import {
  useEffect,
  useState,
} from "react";

import {
  useLocalSearchParams,
} from "expo-router";

import MapView, {
  Marker,
  Polyline,
} from "react-native-maps";

import RoleGuard from "@/src/guards/RoleGuard";

import { trackingService } from "@/src/services/trackingService";

export default function RouteReplayScreen() {

  const { userId } =
    useLocalSearchParams();

  const [route, setRoute] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    loadRoute();

  }, [userId]);

  const loadRoute =
    async () => {

      try {

        setLoading(true);

        const data =
          await trackingService.getMRRoute(
            String(userId)
          );

        setRoute(
          Array.isArray(data)
            ? data
            : data?.route || []
        );

      } catch (err) {

        console.log(
          "ROUTE REPLAY ERROR:",
          err
        );

      } finally {

        setLoading(false);
      }
    };

  if (loading) {

    return (
      <View style={styles.loader}>
        <ActivityIndicator
          size="large"
          color="#1f5f8b"
        />
      </View>
    );
  }

  if (route.length === 0) {

    return (
      <View style={styles.loader}>
        <Text>
          No route history found
        </Text>
      </View>
    );
  }

  const coordinates =
    route.map((p) => ({
      latitude:
        p.latitude || p.lat,
      longitude:
        p.longitude || p.lng,
    }));

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
              coordinates[0]
                .latitude,
            longitude:
              coordinates[0]
                .longitude,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
          }}
        >

          {/* START */}

          <Marker
            coordinate={
              coordinates[0]
            }
            title="Start"
          />

          {/* END */}

          <Marker
            coordinate={
              coordinates[
                coordinates.length -
                  1
              ]
            }
            title="End"
          />

          {/* ROUTE */}

          <Polyline
            coordinates={
              coordinates
            }
            strokeWidth={4}
            strokeColor="#1f5f8b"
          />

        </MapView>

        <View style={styles.infoBox}>

          <Text
            style={
              styles.title
            }
          >
            Route Replay
          </Text>

          <Text>
            Total Points:
            {" "}
            {route.length}
          </Text>

          <Text>
            User ID:
            {" "}
            {userId}
          </Text>

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

    infoBox: {
      position:
        "absolute",
      top: 40,
      left: 20,
      right: 20,
      backgroundColor:
        "#fff",
      padding: 16,
      borderRadius: 12,
      elevation: 5,
    },

    title: {
      fontSize: 18,
      fontWeight: "700",
      marginBottom: 6,
      color: "#1f5f8b",
    },
  });