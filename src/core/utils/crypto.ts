import { pbkdf2Sync, randomBytes, createHmac } from "crypto";

const JWT_SECRET = process.env.JWT_SECRET || "default_jwt_secret_key_change_me_123456789";

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, combined: string): boolean {
  const parts = combined.split(":");
  if (parts.length !== 2) return false;
  const [salt, originalHash] = parts;
  if (!salt || !originalHash) return false;
  const hash = pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return hash === originalHash;
}

export class JwtHelper {
  static sign(payload: Record<string, any>, expiresInSeconds: number = 86400): string {
    const header = { alg: "HS256", typ: "JWT" };
    const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
    const fullPayload = { ...payload, exp };

    const encodedHeader = Buffer.from(JSON.stringify(header)).toString("base64url");
    const encodedPayload = Buffer.from(JSON.stringify(fullPayload)).toString("base64url");

    const signature = createHmac("sha256", JWT_SECRET)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest("base64url");

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  static verify(token: string): Record<string, any> | null {
    try {
      const parts = token.split(".");
      if (parts.length !== 3) return null;

      const [encodedHeader, encodedPayload, signature] = parts;
      if (!encodedHeader || !encodedPayload || !signature) return null;

      const expectedSignature = createHmac("sha256", JWT_SECRET)
        .update(`${encodedHeader}.${encodedPayload}`)
        .digest("base64url");

      if (signature !== expectedSignature) return null;

      const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8"));
      if (payload.exp && Date.now() / 1000 > payload.exp) {
        return null;
      }

      return payload;
    } catch {
      return null;
    }
  }
}
