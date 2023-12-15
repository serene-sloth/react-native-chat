import { type RouterOutputs } from "../../../../../lib/utils/api";
import React from "react";
import { Text, View } from "react-native";
import { styles } from "./styles";
import { cn } from "../../../../../lib/utils/cn";
import { formatDate } from "../../../../../lib/utils/formatters/format-date";

const Avatar: React.FC<{ email: string }> = ({ email }) => {
  return (
    <View className="rounded-full bg-primary w-8 h-8 flex items-center justify-center">
      <Text className="text-white font-medium">{email.charAt(0).toUpperCase()}</Text>
    </View>
  );
};

type Props = {
  message: RouterOutputs["conversations"]["getAll"][number];
};
export const ChatRow: React.FC<Props> = ({ message }) => {
  const hasUnreadMessages = message.unreadCount > 0;

  return (
    <View style={styles.container}>
      <Avatar email={message.partnerEmail} />

      <View style={styles.rowContainer}>
        <View style={styles.messageContainer}>
          <Text style={styles.partnerEmail} numberOfLines={1} ellipsizeMode="tail">
            {message.partnerEmail}
          </Text>

          <Text style={styles.messageText} numberOfLines={1} ellipsizeMode="tail">
            {message.content}
          </Text>
        </View>

        <View style={styles.statusContainer}>
          <Text
            className={cn(
              "text-muted-foreground font-medium",
              hasUnreadMessages && "text-green-700",
            )}
          >
            {formatDate(message.created_at)}
          </Text>

          {hasUnreadMessages && (
            <View
              className="bg-green-700 rounded-lg flex items-center justify-center"
              style={styles.unreadMessagesBadge}
            >
              <Text className="text-white text-xs">{message.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};
