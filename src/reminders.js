import * as N from "expo-notifications";

N.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});
export async function reminder(time) {
  if (!time) {
    await N.cancelScheduledNotificationAsync("daily-prayer");
    return;
  }
  if (!(await N.requestPermissionsAsync()).granted)
    throw Error(
      "Enable notifications in your phone settings to receive reminders.",
    );
  const [hour, minute] = time.split(":").map(Number);
  await N.scheduleNotificationAsync({
    identifier: "daily-prayer",
    content: {
      title: "Time for prayer",
      body: "Your prayer book is ready when you are.",
    },
    trigger: {
      type: N.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
}
