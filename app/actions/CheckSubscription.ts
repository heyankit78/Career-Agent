"use server";
import { auth } from "@clerk/nextjs/server";

export async function checkSubscription() {
  //@ts-ignore
  const { has } = await auth();
  const hasPremiumAccess = has({ plan: "premium" });
  return hasPremiumAccess;
}
