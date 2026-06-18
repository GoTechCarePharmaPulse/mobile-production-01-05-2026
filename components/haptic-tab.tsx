import React from "react";
import {
  Pressable,
  PressableProps,
  GestureResponderEvent,
} from "react-native";
import * as Haptics from "expo-haptics";

type HapticTabProps = PressableProps;

export function HapticTab({
  onPressIn,
  children,
  ...props
}: HapticTabProps) {
  const handlePressIn = async (
    event: GestureResponderEvent
  ) => {
    try {
      await Haptics.impactAsync(
        Haptics.ImpactFeedbackStyle.Light
      );
    } catch {}

    onPressIn?.(event);
  };

  return (
    <Pressable
      {...props}
      onPressIn={handlePressIn}
    >
      {children}
    </Pressable>
  );
}