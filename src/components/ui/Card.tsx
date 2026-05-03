import { View } from "react-native";

export default function Card({ children }: any) {
  return (
    <View
      style={{
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 10,
        marginBottom: 16,
        elevation: 2,
	shadowColor: "#000",
	shadowOpacity: 0.1,
	shadowRadius: 5,
      }}
    >
      {children}
    </View>
  );
}