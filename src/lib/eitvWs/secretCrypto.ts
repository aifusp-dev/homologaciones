import "server-only";
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

// Cifrado en reposo de las contraseñas del WS eITV por empresa. No hay
// ninguna utilidad reutilizable en el repo para esto: src/lib/session.ts
// firma JWT con jose (HS256, payload y expiry fijos, no reversible como
// cifrado simétrico genérico) — repurposearlo sería un hack. AES-256-GCM
// con clave maestra en env, formato de almacenamiento "iv:authTag:cipher"
// en base64.

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;

function masterKey(): Buffer {
  const hex = process.env.EITV_WS_SECRET_KEY;
  if (!hex) throw new Error("Falta EITV_WS_SECRET_KEY en el entorno.");
  const key = Buffer.from(hex, "hex");
  if (key.length !== 32) {
    throw new Error("EITV_WS_SECRET_KEY debe ser un hex de 32 bytes (64 caracteres).");
  }
  return key;
}

export function encryptSecret(plain: string): string {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, masterKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return [iv, authTag, ciphertext].map((buf) => buf.toString("base64")).join(":");
}

export function decryptSecret(stored: string): string {
  const [ivB64, authTagB64, ciphertextB64] = stored.split(":");
  if (!ivB64 || !authTagB64 || !ciphertextB64) {
    throw new Error("Secreto eITV WS con formato inválido (esperado iv:authTag:cipher).");
  }
  const decipher = createDecipheriv(ALGORITHM, masterKey(), Buffer.from(ivB64, "base64"));
  decipher.setAuthTag(Buffer.from(authTagB64, "base64"));
  const plain = Buffer.concat([
    decipher.update(Buffer.from(ciphertextB64, "base64")),
    decipher.final(),
  ]);
  return plain.toString("utf8");
}
