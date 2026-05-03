import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { adminService } from "@/src/modules/admin/api/adminService";

export default function AdminListScreen(){

 const { data = [],isLoading} = useQuery({
   queryKey:["admins"],
   queryFn: adminService.getAdmins
 });

 const deleteAdmin = async (id: string) => {
    try {
      await adminService.deleteAdmin(id);
    } catch (err) {
      console.log("Delete failed");
    }
  };
 if(isLoading) return <Text>Loading...</Text>

 return(
  <View style={{padding:20}}>
   
   <TouchableOpacity
        onPress={() => router.push("/organization/admin/create")}
      >
        <Text>Create Admin</Text>
   </TouchableOpacity>
   

   <FlatList
     data={data}
     keyExtractor={(item)=>item._id}
     renderItem={({ item }) => (

<View style={{padding:10,borderBottomWidth:1}}>

<Text>{item.name}</Text>

<View style={{flexDirection:"row", marginTop:6}}>

<TouchableOpacity
 onPress={()=>router.push(`/organization/admin/${item._id}`)}
>
<Text style={{marginRight:20,color:"blue"}}>Edit</Text>
</TouchableOpacity>

<TouchableOpacity
 onPress={()=>deleteAdmin(item._id)}
>
<Text style={{color:"red"}}>Delete</Text>
</TouchableOpacity>

</View>

</View>

)}
   />

  </View>
 )
}