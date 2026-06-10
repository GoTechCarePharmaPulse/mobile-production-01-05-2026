import React, {
  useEffect,
  useState,
} from "react";

import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
} from "react-native";

import { api } from "@/src/api/api";

export default function TodayVisitsScreen() {

  const [loading, setLoading] =
    useState(true);

  const [visits, setVisits] =
    useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {

      const res =
        await api.get(
          "/visits/today"
        );

      setVisits(
        res.data.visits || []
      );

    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ActivityIndicator />
    );
  }

  return (
    <FlatList
      data={visits}
      keyExtractor={(i: any) => i._id}
      renderItem={({ item }) => (
        <View
          style={{
            padding: 15,
          }}
        >
          <Text>
            {
              item.doctorName
            }
          </Text>

          <Text>
            {
              item.status
            }
          </Text>
        </View>
      )}
    />
  );
}