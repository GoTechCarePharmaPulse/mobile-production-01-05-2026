import React from "react";
import {
  Modal as RNModal,
  View,
  TouchableWithoutFeedback,
} from "react-native";

type Props = {
  visible: boolean;
  children: React.ReactNode;
  onClose?: () => void;
};

export default function Modal({
  visible,
  children,
  onClose,
}: Props) {
  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.45)",
            padding: 20,
          }}
        >
          <TouchableWithoutFeedback>
            <View
              style={{
                backgroundColor: "#fff",
                padding: 20,
                borderRadius: 12,
                width: "90%",
                maxWidth: 450,
              }}
            >
              {children}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </RNModal>
  );
}