import { type ChatScreenProps } from "../../lib/types/screens.type";
import { ActivityIndicator, FlatList, View, type ViewToken } from "react-native";
import React from "react";
import { api } from "../../lib/utils/api";
import { SendMessageForm } from "./_lib/components/send-message-form";
import { useSession } from "../../lib/hooks/use-session";
import { MessageBubble } from "./_lib/components/message-bubble";
import { type Message } from "./_lib/types/queries";

export const ChatScreen: React.FC<ChatScreenProps> = ({ route }) => {
  const otherUserEmail = route.params.email;
  const session = useSession();
  const currentUserEmail = session.user?.email;

  const apiUtils = api.useUtils();
  const messagesQuery = api.conversations.infinite.useInfiniteQuery(
    {
      otherUserEmail,
    },
    {
      getNextPageParam: (lastPage) => lastPage.prevCursor,
    },
  );

  const [messages, setMessages] = React.useState(() => {
    return messagesQuery.data?.pages.flatMap((page) => page.messages);
  });

  const addMessages = React.useCallback((incoming: Message[]) => {
    setMessages((current) => {
      const map: Record<string, (typeof incoming)[0]> = {};
      for (const msg of current ?? []) {
        map[msg.id] = msg;
      }
      for (const msg of incoming ?? []) {
        map[msg.id] = msg;
      }
      return Object.values(map).sort(
        // sort by createdAt descending
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    });
  }, []);

  function markMessageAsRead(updatedMessageId: string): void {
    setMessages((current) =>
      current?.map((msg) => (msg.id === updatedMessageId ? { ...msg, readAt: new Date() } : msg)),
    );
  }
  const markAsReadMutation = api.conversations.markAsRead.useMutation();
  const viewConfigRef = React.useRef({ viewAreaCoveragePercentThreshold: 50 });
  const onViewableItemsChangedRef = React.useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const typedMsgs = viewableItems.map((item) => item.item) as Message[];
      // Only mark messages as read if they are from the other user and not already read
      const unreadMessagesInView = typedMsgs.filter(
        (msg: Message) => msg.sender.email !== currentUserEmail && msg.readAt === null,
      );
      for (const msg of unreadMessagesInView) {
        markAsReadMutation.mutate({ messageId: msg.id });
        markMessageAsRead(msg.id);
      }
    },
  );

  React.useEffect(() => {
    const msgs = messagesQuery.data?.pages.flatMap((page) => page.messages) ?? [];
    addMessages(msgs);

    return () => {
      setMessages([]);
    };
  }, [messagesQuery.data, addMessages]);

  api.conversations.onAdd.useSubscription(undefined, {
    onData: (data) => {
      if (data.destinataries.includes(otherUserEmail)) {
        addMessages([data.message]);
      }
    },
    onStarted() {
      console.log("Subscription started");
    },
    onError(err) {
      console.error(`Error on subscription: ${err.message}`);
      // we might have missed some messages, so we need to invalidate the query
      void apiUtils.conversations.infinite.invalidate();
    },
  });
  api.conversations.onMarkAsRead.useSubscription(undefined, {
    onData: (data) => {
      markMessageAsRead(data.messageId);
    },
    onStarted() {
      console.log("Subscription started");
    },
    onError(err) {
      console.error(`Error on subscription: ${err.message}`);
    },
  });

  async function loadMore(): Promise<void> {
    if (messagesQuery.hasNextPage === true && !messagesQuery.isFetchingNextPage) {
      void messagesQuery.fetchNextPage();
    }
  }

  return (
    <View className="flex-1 justify-between bg-white">
      <FlatList
        data={messages}
        renderItem={({ item }) => <MessageBubble item={item} />}
        keyExtractor={(item) => item.id}
        inverted
        onEndReached={loadMore}
        onEndReachedThreshold={0.1}
        ListFooterComponent={() =>
          messagesQuery.isFetchingNextPage ? (
            <ActivityIndicator size={18} className="my-[24px]" />
          ) : null
        }
        viewabilityConfig={viewConfigRef.current}
        onViewableItemsChanged={onViewableItemsChangedRef.current}
      />

      <SendMessageForm recipientEmail={otherUserEmail} />
    </View>
  );
};
