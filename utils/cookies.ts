// For server-side cookies
import cookie from 'cookie';

export function serializeSecureCookieServerSide(
  name: string,
  value: string,
  maxAge = 60 * 60 * 24, // 24 hours
) {
  // Detect whether we're in a production environment
  // eg. Heroku
  const isProduction = process.env.NODE_ENV === 'production';

  return cookie.serialize(name, value, {
    // maxAge: maxAge,
    maxAge,

    expires: new Date(Date.now() + maxAge * 1000),

    // Important for security
    // Deny cookie access from frontend JavaScript
    httpOnly: true,

    // Important for security
    // Set secure cookies on production
    secure: isProduction,

    path: '/',

    // https://web.dev/samesite-cookies-explained/
    sameSite: 'lax',
  });
}
