import { DateTime } from "luxon";

export function formatDate(date: Date): string {
  const now = DateTime.local();
  const targetDate = DateTime.fromJSDate(date);

  if (targetDate.hasSame(now, "day")) {
    return targetDate.toFormat("h:mm a");
  } else if (targetDate.plus({ days: 1 }).hasSame(now, "day")) {
    return "Yesterday";
  } else {
    return targetDate.toFormat("EEEE dd, LLLL yyyy");
  }
}
