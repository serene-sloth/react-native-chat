import { api } from "../../lib/utils/api";
import React from "react";
import { View, Text, FlatList, Pressable } from "react-native";
import { type HomeScreenProps } from "../../lib/types/screens.type";
import { NewChatModal } from "./_lib/components/new-chat-modal";
import { MessageCircle } from "lucide-react-native";
import { ChatRow } from "./_lib/components/chat-row";
import { useIsFocused } from "@react-navigation/native";

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [openNewChatModal, setOpenNewChatModal] = React.useState(false);
  const isFocused = useIsFocused();
  const conversationsQuery = api.conversations.getAll.useQuery(undefined, {
    refetchOnMount: "always",
  });
  React.useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      void conversationsQuery.refetch();
    });
    return unsubscribe;
  }, [isFocused, conversationsQuery, navigation]);
  const conversations = conversationsQuery.data ?? [];

  return (
    <View className="flex-1 p-4 bg-background">
      <Text className="text-xl border-b mb-2 border-border">Chats</Text>

      <FlatList
        data={conversations}
        renderItem={({ item }) => (
          <Pressable onPress={() => navigation.navigate("Chat", { email: item.partnerEmail })}>
            <ChatRow message={item} />
          </Pressable>
        )}
        keyExtractor={(message) => message.partnerEmail}
      />

      <Pressable
        className="absolute right-0 bottom-0 mr-3 mb-3 rounded-2xl bg-primary w-14 h-14 flex items-center justify-center"
        onPress={() => {
          setOpenNewChatModal(true);
        }}
      >
        <MessageCircle size={28} stroke="white" />
      </Pressable>

      <NewChatModal
        open={openNewChatModal}
        onClose={() => setOpenNewChatModal(false)}
        onSubmit={(data) => {
          console.log("data", data);
          navigation.navigate("Chat", { email: data.recipient });
        }}
      />
    </View>
  );
};
