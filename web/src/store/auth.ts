"use client";

import localforage from "localforage";

export const AUTH_KEY_STORAGE_KEY = "chatgpt2api_auth_key";
export const BASE_URL_STORAGE_KEY = "chatgpt2api_sub2api_base_url";

const authStorage = localforage.createInstance({
  name: "chatgpt2api",
  storeName: "auth",
});

function normalizeBaseUrl(baseUrl: string) {
  const normalized = String(baseUrl || "").trim().replace(/\/+$/, "");
  if (!normalized) {
    return "";
  }
  if (normalized.endsWith("/v1")) {
    return normalized.slice(0, -3);
  }
  return normalized;
}

export async function getStoredAuthKey() {
  if (typeof window === "undefined") {
    return "";
  }
  const value = await authStorage.getItem<string>(AUTH_KEY_STORAGE_KEY);
  return String(value || "").trim();
}

export async function setStoredAuthKey(authKey: string) {
  const normalizedAuthKey = String(authKey || "").trim();
  if (!normalizedAuthKey) {
    await clearStoredAuthKey();
    return;
  }
  await authStorage.setItem(AUTH_KEY_STORAGE_KEY, normalizedAuthKey);
}

export async function clearStoredAuthKey() {
  if (typeof window === "undefined") {
    return;
  }
  await authStorage.removeItem(AUTH_KEY_STORAGE_KEY);
}

export async function getStoredBaseUrl() {
  if (typeof window === "undefined") {
    return "";
  }
  const value = await authStorage.getItem<string>(BASE_URL_STORAGE_KEY);
  return normalizeBaseUrl(String(value || ""));
}

export async function setStoredBaseUrl(baseUrl: string) {
  const normalizedBaseUrl = normalizeBaseUrl(baseUrl);
  if (!normalizedBaseUrl) {
    await clearStoredBaseUrl();
    return;
  }
  await authStorage.setItem(BASE_URL_STORAGE_KEY, normalizedBaseUrl);
}

export async function clearStoredBaseUrl() {
  if (typeof window === "undefined") {
    return;
  }
  await authStorage.removeItem(BASE_URL_STORAGE_KEY);
}

export async function clearStoredConnection() {
  await Promise.all([clearStoredAuthKey(), clearStoredBaseUrl()]);
}
