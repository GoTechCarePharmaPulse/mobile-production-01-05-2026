import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";

const TASK_NAME = "crm-sync";

TaskManager.defineTask(TASK_NAME, async () => {

  try {

    console.log("Running background sync");

    // TODO sync offline records

    return BackgroundFetch.BackgroundFetchResult.NewData;

  } catch {

    return BackgroundFetch.BackgroundFetchResult.Failed;

  }

});

export const registerBackgroundSync = async () => {

  await BackgroundFetch.registerTaskAsync(TASK_NAME, {
    minimumInterval: 900
  });

};