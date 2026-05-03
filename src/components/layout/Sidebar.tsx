import { View, Text, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/src/context/AuthContext";
import { menuConfig } from "@/src/config/menuConfig";

export default function Sidebar() {

  const { user } = useAuth();

  const menu = menuConfig[user?.role] || [];

  return (

    <View style={{
      width:220,
      backgroundColor:"#1e293b",
      paddingTop:30,
      paddingLeft:10
    }}>

      {menu.map((item:any,i:number)=>(
        <TouchableOpacity
          key={i}
          onPress={()=>router.push(item.route)}
          style={{marginBottom:16}}
        >

          <Text style={{
            color:"#fff",
            fontSize:15
          }}>
            {item.name}
          </Text>

        </TouchableOpacity>
      ))}

    </View>

  );

}