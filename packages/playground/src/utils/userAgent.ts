import { HEADER_KEYS } from "@/const/header";
import { headers } from "next/headers";

export const getUserAgent = async () => {
  const headersList = await headers();

  return {
    ua: headersList.get("user-agent"),
    browser: JSON.parse(headersList.get(HEADER_KEYS.UA_BROWSER) || "{}"),
    device: JSON.parse(headersList.get(HEADER_KEYS.UA_DEVICE) || "{}"),
    os: JSON.parse(headersList.get(HEADER_KEYS.UA_OS) || "{}"),
  };
};

export const osToDeviceVariant = (os: { name: string; version: string }) => {
  const { name } = os;
  const osName = name.toLowerCase().replace(" ", "");

  if (osName.includes("ios")) {
    return "ios";
  }

  // if (osName.includes("android")) {
  //   return "android";
  // }

  return "web";
};
