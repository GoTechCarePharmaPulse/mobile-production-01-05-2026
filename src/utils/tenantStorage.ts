import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "TENANT_CONFIG";

export const saveTenant = async (data: any) => {
  await AsyncStorage.setItem(KEY, JSON.stringify(data));
};

export const getTenant = async () => {
  const data = await AsyncStorage.getItem(KEY);
  return data ? JSON.parse(data) : null;
};

export const clearTenant = async () => {
  await AsyncStorage.removeItem(KEY);
};