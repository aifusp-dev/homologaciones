import "server-only";
import { OAuth2Client } from "google-auth-library";

const clientId = process.env.GOOGLE_CLIENT_ID;
if (!clientId) {
  throw new Error("GOOGLE_CLIENT_ID environment variable is not set");
}

const client = new OAuth2Client(clientId);

export type GoogleIdentity = {
  googleId: string;
  email: string;
  name: string;
};

/**
 * Verifica el credential (JWT) que entrega Google Identity Services en el
 * frontend. Lanza si el token no es válido, ha expirado, o no es para
 * nuestro client id.
 */
export async function verifyGoogleIdToken(idToken: string): Promise<GoogleIdentity> {
  const ticket = await client.verifyIdToken({ idToken, audience: clientId });
  const payload = ticket.getPayload();

  if (!payload || !payload.sub || !payload.email) {
    throw new Error("Token de Google inválido.");
  }
  if (!payload.email_verified) {
    throw new Error("El email de Google no está verificado.");
  }

  return {
    googleId: payload.sub,
    email: payload.email,
    name: payload.name ?? payload.email,
  };
}
