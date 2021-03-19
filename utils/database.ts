import postgres, { sql } from 'postgres';
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

  return newUser;
}
