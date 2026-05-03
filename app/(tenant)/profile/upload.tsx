import { View, Text, TouchableOpacity } from "react-native";

export default function UploadProfile() {
  const handleUpload = () => {
    console.log("Upload Image");
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Upload Profile Image</Text>

      <TouchableOpacity onPress={handleUpload}>
        <Text>Select Image</Text>
      </TouchableOpacity>
    </View>
  );
}