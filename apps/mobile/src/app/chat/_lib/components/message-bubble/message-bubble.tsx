import React from "react";
import { useSession } from "../../../../../lib/hooks/use-session";
import { cn } from "../../../../../lib/utils/cn";
import { Text, View } from "react-native";
import { formatDate } from "../../../../../lib/utils/formatters/format-date";
import { CheckCheckIcon } from "lucide-react-native";
import { type Message } from "../../types/queries";

type Props = {
  item: Message;
};

export const MessageBubble: React.FC<Props> = ({ item }) => {
  const session = useSession();
  const isCurrentUser = item.sender.email === session.user?.email;

  return (
    <View
      className={cn(
        "rounded-lg m-[5] p-[10]",
        isCurrentUser ? "bg-[#035d4d] self-end" : "bg-white border-[0.5px] border-black self-start",
      )}
    >
      <Text className={cn(isCurrentUser ? "text-white" : "text-black")}>{item.content}</Text>

      <View
        className={cn(
          "flex flex-row items-center",
          isCurrentUser ? "justify-end" : "justify-start",
        )}
      >
        <Text className={cn("text-[12px]", isCurrentUser ? "text-[#a5d8cf]" : "text-[#6c6c6c]")}>
          {formatDate(item.createdAt)}
        </Text>

        <CheckCheckIcon
          size={14}
          stroke={item.readAt !== null ? "#2a7fd9" : isCurrentUser ? "#a5d8cf" : "#6c6c6c"}
          className="ml-1"
        />
      </View>
    </View>
  );
};
