import React,{useEffect,useState} from "react";
import { View,Text } from "react-native";

export default function AnalyticsDashboard(){

  const [stats,setStats] = useState({});

  useEffect(()=>{

    fetch("/api/analytics")
      .then(r=>r.json())
      .then(setStats);

  },[]);

  return(
    <View>

      <Text>Total Visits: {stats.visits}</Text>
      <Text>Total Orders: {stats.orders}</Text>
      <Text>Revenue: {stats.revenue}</Text>

    </View>
  );
}