import { View, Text, SafeAreaView, TouchableOpacity, FlatList, TextInput } from "react-native";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";

const menuItems = [
  { title: "MR List", icon: "people" },
  { title: "Doctors", icon: "medical" },
  { title: "Medicines", icon: "medkit" },
  { title: "Stocks", icon: "cube" },
  { title: "Accounts", icon: "wallet" },
  { title: "Sell Details", icon: "clipboard" },
  { title: "MR Tasks", icon: "list" },
  { title: "MR Visits", icon: "wifi" },
];

const doctors = [
  {
    id: "1",
    name: "Salim Rahman Ji",
    code: "DR000033",
    location: "Naugaon",
    mr: "Sanjay (MR000001)",
    balance: 0,
    last: "6 months 10 days ago",
  },
  {
    id: "2",
    name: "Salim sadruddinagar",
    code: "DR000029",
    location: "Sadruddinagar",
    mr: "Kavindra Kumar (MR000002)",
    balance: 1412,
    last: "today",
  },
];

export default function PlatformDashboard() {

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f5f7fb" }}>
      
      {/* HEADER */}
      <View style={{
        backgroundColor: "#1f5f8b",
        padding: 16,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20
      }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <View>
            <Text style={{ color: "#fff", fontSize: 18, fontWeight: "bold" }}>
              Hi, Super Admin
            </Text>
            <Text style={{ color: "#fff", marginTop: 5 }}>₹ 197141</Text>
          </View>
          <Ionicons name="menu" size={26} color="#fff" />
        </View>
      </View>

      {/* MENU GRID */}
      <View style={{
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        padding: 16
      }}>
        {menuItems.map((item, index) => (
          <View key={index} style={{
            width: "23%",
            backgroundColor: "#1f5f8b",
            padding: 12,
            borderRadius: 12,
            alignItems: "center",
            marginBottom: 12
          }}>
            <Ionicons name={item.icon} size={20} color="#fff" />
            <Text style={{ color: "#fff", fontSize: 12, marginTop: 5 }}>
              {item.title}
            </Text>
          </View>
        ))}
      </View>

      {/* TABS */}
      <View style={{
        flexDirection: "row",
        marginHorizontal: 16,
        backgroundColor: "#ddd",
        borderRadius: 30
      }}>
        <View style={{
          flex: 1,
          backgroundColor: "#1f5f8b",
          padding: 10,
          borderRadius: 30
        }}>
          <Text style={{ color: "#fff", textAlign: "center" }}>
            Balance list
          </Text>
        </View>

        <View style={{ flex: 1, padding: 10 }}>
          <Text style={{ textAlign: "center" }}>Admins</Text>
        </View>
      </View>

      {/* SEARCH */}
      <View style={{
        margin: 16,
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 25,
        paddingHorizontal: 15,
        flexDirection: "row",
        alignItems: "center"
      }}>
        <Ionicons name="search" size={18} />
        <TextInput
          placeholder="Search Doctors"
          style={{ marginLeft: 10, flex: 1 }}
        />
      </View>

      {/* FILTER */}
      <View style={{
        flexDirection: "row",
        marginHorizontal: 16,
        alignItems: "center"
      }}>
        <View style={{
          flex: 1,
          borderWidth: 1,
          borderColor: "#ddd",
          padding: 12,
          borderRadius: 10
        }}>
          <Text>Select MR</Text>
        </View>

        <TouchableOpacity style={{
          marginLeft: 10,
          backgroundColor: "#fff",
          padding: 12,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: "#ddd"
        }}>
          <MaterialIcons name="filter-alt" size={20} color="red" />
        </TouchableOpacity>
      </View>

      {/* LIST */}
      <FlatList
        data={doctors}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View style={{
            backgroundColor: "#fff",
            padding: 14,
            borderRadius: 12,
            marginBottom: 12,
            elevation: 2
          }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ fontWeight: "bold" }}>
                {item.name} ({item.code})
              </Text>
              <Text style={{ color: item.balance > 0 ? "#1f5f8b" : "red" }}>
                {item.balance}
              </Text>
            </View>

            <Text>{item.location}</Text>
            <Text>{item.mr}</Text>

            <Text style={{ color: item.last.includes("months") ? "red" : "green" }}>
              Last transaction: {item.last}
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}