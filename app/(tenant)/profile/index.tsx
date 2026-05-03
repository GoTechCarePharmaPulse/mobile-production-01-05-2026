import { View, Text, Image, TouchableOpacity } from "react-native";
import { useAuth } from "@/src/context/AuthContext";

export default function ProfileScreen() {

  const { user, logout } = useAuth();

return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: "bold" }}>
        My Profile
      </Text>

	<Image
        source={{uri:user?.avatar}}
        style={{width:100,height:100,borderRadius:50}}
      />

      <Text>Name: {user?.firstName} {user?.lastName}</Text>
      <Text>Email: {user?.email || "N/A"}</Text>
      <Text>Mobile: {user?.mobile}</Text>
      <Text>Role: {user?.role}</Text>
	
	<TouchableOpacity>
        <Text>Update Photo</Text>
      </TouchableOpacity>

      <TouchableOpacity>
        <Text>Delete Photo</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={logout}
        style={{
          marginTop: 20,
          backgroundColor: "red",
          padding: 10,
          borderRadius: 6,
        }}
      >
        <Text style={{ color: "#fff" }}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

