import React from "react";
import { Modal as RNModal, View } from "react-native";

export default function Modal({ visible, children }: any) {
  return (
    <RNModal visible={visible} transparent animationType="slide">
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(0,0,0,0.4)",
        }}
      >
        <View
          style={{
            backgroundColor: "#fff",
            padding: 20,
            borderRadius: 10,
            width: "80%",
          }}
        >
          {children}
        </View>
      </View>
    </RNModal>
  );
}