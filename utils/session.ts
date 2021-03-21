import crypto from 'crypto';

export default function generateSession() {
  return crypto.randomBytes(24).toString('base64');
}
