import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { api } from "@/src/api/api";
import { useQuery } from "@tanstack/react-query";
import { doctorService } from "@/src/modules/doctor/doctorService";

export default function DoctorListScreen() {

 const [doctors,setDoctors] = useState([]);


const { data, isLoading, error } = useQuery({
  queryKey: ["doctors"],
  queryFn: doctorService.getDoctors
});

 const fetchDoctors = async ()=>{
   const res = await api.get("/doctors");
   setDoctors(res.data);
 }

 return(

<View style={{flex:1,padding:20}}>

<FlatList
data={doctors}
keyExtractor={(item)=>item._id}

renderItem={({item})=>(
<TouchableOpacity>

<Text style={{fontSize:18}}>
{item.name}
</Text>

<Text>
{item.specialization}
</Text>

</TouchableOpacity>
)}
/>

</View>

 )
}