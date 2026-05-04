export const placeholderClerkPublishableKey =
  "pk_test_aWRlYWwtdGlnZXItMTIuY2xlcmsuYWNjb3VudHMuZGV2JA==";

export function hasRealClerkPublishableKey() {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  return Boolean(
    publishableKey &&
      publishableKey !== placeholderClerkPublishableKey &&
      !publishableKey.includes("your_publishable_key"),
  );
}

export function hasRealClerkKeys() {
  const secretKey = process.env.CLERK_SECRET_KEY;

  return Boolean(
    hasRealClerkPublishableKey() &&
      secretKey &&
      !secretKey.includes("your_secret_key"),
  );
}
