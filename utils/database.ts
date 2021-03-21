import camelcaseKeys from 'camelcase-keys';
import postgres from 'postgres';
import generateSession from './session';
import setPostgresDefaultsOnHeroku from './setPostgresDefaultsOnHeroku';

setPostgresDefaultsOnHeroku();

require('dotenv-safe').config();

let sql;

if (process.env.NODE_ENV === 'production') {
  // Heroku needs SSL connections but
  // has an "unauthorized" certificate
  // https://devcenter.heroku.com/changelog-items/852
  sql = postgres({ ssl: { rejectUnauthorized: false } });
} else {
  if (!globalThis.__postgresSqlClient) {
    globalThis.__postgresSqlClient = postgres();
  }
  sql = globalThis.__postgresSqlClient;
}

export async function createUser(
  userName: string,
  firstName: string,
  lastName: string,
  password: string,
) {
  const passwordHash = '';

  const newUser = await sql`
    INSERT INTO users (
      user_name,
      first_name,
      last_name,
      passwordHash
    )
    VALUES
    (
      ${userName},
      ${firstName},
      ${lastName},
      ${passwordHash}
    )
    RETURNING *;
  `;

  return camelcaseKeys(newUser);
}

// Used for time constraint for log in/register process
export async function createSessionFiveMinutes() {
  const token = generateSession();

  const newSessionFiveMinutes = await sql`
  INSERT INTO session (
    token, expiry_timestamp
  )
  VALUES
  (
    ${token},
    NOW() + INTERVAL '5 minutes'
  )
  RETURNING *;
`;

  return camelcaseKeys(newSessionFiveMinutes);
}

// Used for trip planning without being logged in.
export async function createSessionTwoHours() {
  const token = generateSession();

  const newSessionTwoHours = await sql`
  INSERT INTO session (
    token, expiry_timestamp
  )
  VALUES
  (
    ${token},
    NOW() + INTERVAL '2 hours'
  )
  RETURNING *;
`;

  return camelcaseKeys(newSessionTwoHours)[0];
}

// Used for trip planning and being logged in.
export async function createSessionTwentyFourHours() {
  const token = generateSession();

  const newSessionTwentyFourHours = await sql`
  INSERT INTO session (
    token, expiry_timestamp
  )
  VALUES
  (
    ${token},
    NOW() + INTERVAL '24 hours'
  )
  RETURNING *;
`;

  return camelcaseKeys(newSessionTwentyFourHours);
}

export async function deleteAllExpiredSessions() {
  const sessions = await sql`
  DELETE FROM
    session
  WHERE expiry_timestamp < NOW()
  RETURNING *;
  `;

  return camelcaseKeys(sessions);
}

module.exports = {
  createUser,
  deleteAllExpiredSessions,
  createSessionFiveMinutes,
  createSessionTwoHours,
  createSessionTwentyFourHours,
};
