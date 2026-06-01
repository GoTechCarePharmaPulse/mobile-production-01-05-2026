import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import RoutePlannerScreen from "../screens/mr/RoutePlannerScreen";
import DoctorPredictionScreen from "../screens/admin/DoctorPredictionScreen";
import TerritoryHeatmap from "../screens/admin/TerritoryHeatmapScreen";
import AnalyticsDashboard from "../screens/admin/AnalyticsDashboard";
import DoctorInfluenceGraph from "../screens/admin/DoctorInfluenceGraph";

const Stack = createNativeStackNavigator();

export default function AdminNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MRRoutePlanner" component={RoutePlannerScreen} />
      <Stack.Screen name="DoctorPrediction" component={DoctorPredictionScreen} />
      <Stack.Screen name="TerritoryHeatmap" component={TerritoryHeatmap} />
      <Stack.Screen name="AnalyticsDashboard" component={AnalyticsDashboard} />
      <Stack.Screen name="DoctorInfluence" component={DoctorInfluenceGraph} />
      <Stack.Screen name="RoutePlanner" component={RoutePlannerScreen} />
    </Stack.Navigator>
  );
}
