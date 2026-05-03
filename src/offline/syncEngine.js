export const syncData = async () => {
  const offlineData = await getOfflineData();

  for (let item of offlineData) {
    await api.post(item.endpoint, item.payload);
  }

  clearOffline();
};