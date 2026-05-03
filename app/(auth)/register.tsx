import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import { api } from "@/src/api/api";

export default function Register() {

  const [name,setName] = useState("");
  const [mobile,setMobile] = useState("");
  const [password,setPassword] = useState("");

  const registerUser = async () => {

    if(!name || !mobile || !password){
      Alert.alert("Error","All fields required");
      return;
    }

    try{

      await api.post("/auth/register",{
        name,
        mobile,
        password
      });

      Alert.alert("Success","Account created");
      router.push("/(auth)/login");

    }catch(err:any){

      console.log("REGISTER ERROR",err?.response?.data || err.message);
      Alert.alert("Error","Registration failed");

    }

  };

  return(

    <View style={{padding:20}}>

      <Text style={{fontSize:22,marginBottom:20}}>Register</Text>

      <TextInput
        placeholder="Name"
        value={name}
        onChangeText={setName}
        style={{borderWidth:1,padding:10,marginBottom:12}}
      />

      <TextInput
        placeholder="Mobile"
        value={mobile}
        onChangeText={setMobile}
        keyboardType="phone-pad"
        style={{borderWidth:1,padding:10,marginBottom:12}}
      />

      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{borderWidth:1,padding:10,marginBottom:20}}
      />

      <TouchableOpacity
        onPress={registerUser}
        style={{backgroundColor:"#1976d2",padding:14,borderRadius:6}}
      >
        <Text style={{color:"#fff",textAlign:"center"}}>Register</Text>
      </TouchableOpacity>

    </View>

  );

}