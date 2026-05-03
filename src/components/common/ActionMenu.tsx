import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Action = {
  label: string;
  onPress: () => void;
  color?: string;
  show?: boolean;
};

type Props = {
  actions: Action[];
  isOpen: boolean;
  onToggle: () => void;
};

export default function ActionMenu({ actions, isOpen, onToggle }: Props) {
  return (
    <View style={{ position: "relative", zIndex: 999 }}>
      
      {/* BUTTON */}
      <TouchableOpacity onPress={onToggle}>
        <Ionicons name="ellipsis-vertical" size={18} />
      </TouchableOpacity>

      {/* MENU */}
      {isOpen && (
        <View style={styles.menu}>
          {actions
            .filter((a) => a.show !== false)
            .map((action, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  onToggle();
                  action.onPress();
                }}
                style={[
                  styles.menuItem,
                  {
                    backgroundColor: action.color
                      ? action.color + "20"
                      : "#f3f4f6",
                  },
                ]}
              >
                <Text style={{ color: action.color || "#333", fontWeight: "600" }}>
                  {action.label}
                </Text>
              </TouchableOpacity>
            ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  menu: {
    position: "absolute",
    right: 0,
    top: 25,
    backgroundColor: "#fff",
    borderRadius: 8,
    elevation: 5,
    paddingVertical: 5,
    minWidth: 150,
    zIndex: 999,
  },
  menuItem: {
    padding: 10,
    borderRadius: 6,
    marginBottom: 5,
  },
});