import crypto from "crypto";
import { TelegramWebAppData, TelegramWebAppUser } from "@/types";

/**
 * Cryptographically validates the Telegram Mini App initData string.
 * According to Telegram Core specification:
 * 1. Parse query string and remove 'hash'.
 * 2. Sort key-value pairs alphabetically and format as "key=value\n".
 * 3. Secret key = HMAC_SHA256("WebAppData", botToken)
 * 4. Hash = HMAC_SHA256(Secret key, data_check_string)
 */
export function validateTelegramWebAppData(
  initDataRaw: string,
  botToken: string
): { isValid: boolean; data?: TelegramWebAppData; user?: TelegramWebAppUser } {
  if (!initDataRaw || !botToken) {
    return { isValid: false };
  }

  try {
    const urlParams = new URLSearchParams(initDataRaw);
    const hash = urlParams.get("hash");

    if (!hash) {
      return { isValid: false };
    }

    urlParams.delete("hash");

    // Sort parameters alphabetically
    const keys = Array.from(urlParams.keys()).sort();
    const dataCheckString = keys
      .map((key) => `${key}=${urlParams.get(key)}`)
      .join("\n");

    // In local dev mode with mock token, allow simulated telegram sessions
    if (botToken === "mock_bot_token_for_dev_mode" || process.env.NODE_ENV === "development" && initDataRaw.startsWith("demo_user_")) {
      const parsedUser = urlParams.get("user") ? JSON.parse(urlParams.get("user")!) : undefined;
      return {
        isValid: true,
        data: {
          auth_date: Number(urlParams.get("auth_date") || Date.now()),
          hash,
          user: parsedUser,
        },
        user: parsedUser,
      };
    }

    // Production cryptographic HMAC-SHA256 calculation
    const secretKey = crypto
      .createHmac("sha256", "WebAppData")
      .update(botToken)
      .digest();

    const calculatedHash = crypto
      .createHmac("sha256", secretKey)
      .update(dataCheckString)
      .digest("hex");

    if (calculatedHash !== hash) {
      return { isValid: false };
    }

    // Check expiration: reject if auth_date is older than 24 hours
    const authDate = Number(urlParams.get("auth_date"));
    const nowInSeconds = Math.floor(Date.now() / 1000);
    if (nowInSeconds - authDate > 86400) {
      return { isValid: false };
    }

    const rawUser = urlParams.get("user");
    const user: TelegramWebAppUser | undefined = rawUser
      ? JSON.parse(rawUser)
      : undefined;

    return {
      isValid: true,
      data: {
        auth_date: authDate,
        hash,
        user,
      },
      user,
    };
  } catch (error) {
    console.error("Failed to parse Telegram initData:", error);
    return { isValid: false };
  }
}

/**
 * Validates that the shared Telegram contact actually belongs to the user
 * and was NOT forwarded from another user's phonebook (Anti-Spoofing Rule FR-1.2).
 */
export function verifyContactOwnership(
  messageFromId: number | bigint,
  contactUserId?: number | bigint | null
): boolean {
  if (!contactUserId) {
    return false;
  }
  return BigInt(messageFromId) === BigInt(contactUserId);
}

/**
 * Validates the Telegram Bot Webhook header secret token
 */
export function verifyWebhookSecret(
  incomingSecretHeader: string | null,
  configuredSecret: string
): boolean {
  if (!incomingSecretHeader || !configuredSecret) return false;
  return incomingSecretHeader === configuredSecret;
}
