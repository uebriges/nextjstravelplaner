import crypto from 'crypto';
import { serializeSecureCookieServerSide } from './cookies';
import { createSessionFiveMinutes } from './database';

export function generateToken() {
  return crypto.randomBytes(24).toString('base64');
}

export async function createSessionWithCookie() {
  const session = await createSessionFiveMinutes();
  return {
    session: session,
    sessionCookie: serializeSecureCookieServerSide(
      'session',
      session.token,
      60 * 5,
    ),
  };
}
