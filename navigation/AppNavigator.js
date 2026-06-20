// navigation/AppNavigator.js
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Login from "../screens/Login";

// Import your unified dashboards
import MRGlobalDashboard from "../app/(tenant)/crm/mrs/dashboard";   // operational dashboard
import MRAnalyticsDashboard from "../app/(tenant)/dashboard/mr";    // analytics dashboard

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen name="Login" component={Login} />
      
      {/* Global MR Dashboard (map + visits) */}
      <Stack.Screen
        name="MRGlobalDashboard"
        component={MRGlobalDashboard}
        options={{ title: "MR Dashboard" }}
      />

      {/* Analytics Dashboard (stats summary) */}
      <Stack.Screen
        name="MRAnalyticsDashboard"
        component={MRAnalyticsDashboard}
        options={{ title: "MR Analytics" }}
      />
    </Stack.Navigator>
  );
}
