import { auth } from "@clerk/nextjs/server";

import { hasRealClerkKeys } from "@/lib/clerk-config";

export async function getActiveUserId() {
  if (!hasRealClerkKeys()) {
    return process.env.NODE_ENV === "production" ? null : "local-dev-user";
  }

  const { userId } = await auth();

  return userId;
}
