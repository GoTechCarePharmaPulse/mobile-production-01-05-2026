import React,{useEffect,useState} from "react";
import { View,Text } from "react-native";

export default function VisitPlanner(){

  const [doctors,setDoctors] = useState([]);

  useEffect(()=>{

    fetch("/api/visit-plan")
      .then(r=>r.json())
      .then(setDoctors);

  },[]);

  return(

    <View>

      {doctors.map(d=>(
        <Text key={d._id}>
          {d.name}
        </Text>
      ))}

    </View>

  );

}