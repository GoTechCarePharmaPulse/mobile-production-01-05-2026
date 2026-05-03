import React from "react";
import { View, TextInput } from "react-native";

export default function DoctorForm({doctor,setDoctor}){

return(

<View>

<TextInput
placeholder="Doctor Name"
value={doctor.name}
onChangeText={(v)=>setDoctor({...doctor,name:v})}
/>

<TextInput
placeholder="Specialization"
value={doctor.specialization}
onChangeText={(v)=>setDoctor({...doctor,specialization:v})}
/>

</View>

)

}