import React from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSession } from "../../lib/hooks/use-session";
import { LogOutIcon } from "lucide-react-native";

export const Header: React.FC = () => {
  const session = useSession();

  return (
    <SafeAreaView className="flex flex-row justify-between items-center px-6 py-3 border-b border-border">
      <View className="flex flex-col">
        <Text className="text-xl font-bold text-primary">Axionet</Text>

        <Text className="text-sm text-primary">
          {session.status === "authenticated" && session.user?.email}
        </Text>
      </View>

      {session.status === "authenticated" && (
        <Pressable
          onPress={() => {
            session.signOutMutation.mutate();
          }}
          className="border border-black px-2 py-1 rounded-md"
        >
          <LogOutIcon size={18} stroke="black" />
        </Pressable>
      )}
    </SafeAreaView>
  );
};
