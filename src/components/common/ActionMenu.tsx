import React from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Action = {
  label: string;
  onPress: () => void;
  color?: string;
  show?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
};

type Props = {
  actions: Action[];
  isOpen: boolean;
  onToggle: () => void;
};

export default function ActionMenu({
  actions,
  isOpen,
  onToggle,
}: Props) {
  const visibleActions = actions.filter(
    (a) => a.show !== false
  );

  return (
    <View style={styles.container}>
      {/* 3 DOT BUTTON */}
      <TouchableOpacity
        onPress={onToggle}
        hitSlop={{
          top: 10,
          bottom: 10,
          left: 10,
          right: 10,
        }}
      >
        <Ionicons
          name="ellipsis-vertical"
          size={20}
          color="#333"
        />
      </TouchableOpacity>

      {/* MENU */}
      {isOpen && (
        <View style={styles.menu}>
          <ScrollView
            nestedScrollEnabled
            showsVerticalScrollIndicator={false}
            style={{
              maxHeight: 300,
            }}
          >
            {visibleActions.map(
              (action, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.menuItem,
                    {
                      backgroundColor:
                        action.color
                          ? `${action.color}15`
                          : "#fff",
                    },
                  ]}
                  onPress={() => {
                    onToggle();
                    action.onPress();
                  }}
                >
                  {action.icon && (
                    <Ionicons
                      name={action.icon}
                      size={18}
                      color={
                        action.color ||
                        "#333"
                      }
                      style={{
                        marginRight: 10,
                      }}
                    />
                  )}

                  <Text
                    style={[
                      styles.menuText,
                      {
                        color:
                          action.color ||
                          "#333",
                      },
                    ]}
                  >
                    {action.label}
                  </Text>
                </TouchableOpacity>
              )
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    alignItems: "flex-end",
    zIndex: 99999,
    elevation: 999,
  },

  menu: {
    position: "absolute",
    top: 28,
    right: 0,

    minWidth: 180,
    maxWidth: 240,

    backgroundColor: "#fff",

    borderRadius: 10,

    borderWidth: 1,
    borderColor: "#e5e7eb",

    zIndex: 9999,
    elevation: 20,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",

    paddingVertical: 12,
    paddingHorizontal: 14,
  },

  menuText: {
    fontSize: 14,
    fontWeight: "500",
  },
});