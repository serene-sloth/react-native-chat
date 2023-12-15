import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "react-native";

type Props = {
  email: string;
};

export const ChatHeader: React.FC<Props> = ({ email }) => {
  return (
    <SafeAreaView className="flex flex-row justify-between items-center px-6 py-3 border-b border-border">
      <Text className="text-base font-bold text-black">{email}</Text>
    </SafeAreaView>
  );
};
