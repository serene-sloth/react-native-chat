import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
  },
  rowContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  messageContainer: {
    flexShrink: 1,
    flexDirection: "column",
    gap: 4,
    marginRight: 20,
  },
  partnerEmail: {
    fontWeight: "500",
    fontSize: 15,
  },
  messageText: {
    overflow: "hidden",
    fontSize: 16,
  },
  statusContainer: {
    alignItems: "flex-end",
    gap: 10,
    alignContent: "center",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  unreadMessagesBadge: {
    width: 24,
    height: 24,
    borderRadius: 12, // half of width and height
    backgroundColor: "green",
  },
});
