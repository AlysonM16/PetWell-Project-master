import * as SecureStore from "expo-secure-store";

const REFRESH_KEY = "refresh_token";

export const saveRefresh = (token) => SecureStore.setItemAsync(REFRESH_KEY, token);
export const getRefresh  = () => SecureStore.getItemAsync(REFRESH_KEY);
export const clearTokens = () => SecureStore.deleteItemAsync(REFRESH_KEY);