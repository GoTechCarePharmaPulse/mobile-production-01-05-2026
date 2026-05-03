import { View, Text, TouchableOpacity } from "react-native";

export default function CompaniesScreen() {

  const createCompany = async () => {
  await api.post("/company/create", {
    name: companyName
  });
};
  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text>Companies</Text>

      <TouchableOpacity>
        <Text>Create Company</Text>
      </TouchableOpacity>
    </View>
  );
}