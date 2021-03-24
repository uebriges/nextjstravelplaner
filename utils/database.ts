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

export async function getCurrentWaypoints(token: String) {
  const sessionId = await getSessionIdByToken(token);
  console.log('sessionId getcurrentwaypoints: ', sessionId);

  console.log('in database');
  const route = await sql`
  SELECT *
  FROM trip, waypoint
  WHERE session_id = ${sessionId[0].id.toString()}
  AND trip.id = waypoint.trip_id;
  `;

  console.log('route: ', route);
  console.log('route here');

  return route.map((currentRoute) => camelcaseKeys(currentRoute));
}

export type waypointDBType = {
  id: number;
  trip_id: number;
  notes: string;
  meansOfTransport: string;
  visaInformation: string;
  favorite: boolean;
  longitude: string;
  latitude: string;
  orderNumber: number;
  waypointName: string;
};

// Set a new waypoint to the map
export async function setNewWaypoint(
  token: String,
  longitude: String,
  latitude: String,
  waypointName: String,
) {
  console.log('setNewWaypoint');

  // Get the session id of the current session
  const sessionId = await getSessionIdByToken(token);

  if (sessionId.length > 0) {
    // Get the tripId to the corresponding sessionId
    let tripId = await sql`
    SELECT id
    FROM trip
    WHERE session_id = ${sessionId[0].id.toString()}
  ;`;

    console.log('is array: ', Array.isArray(tripId));
    console.log('tripId before: ', tripId.length);
    // tripId = tripId.slice(-2);
    console.log('tripId AFTER: ', tripId);

    // If no trip created yet, create a new one
    if (tripId.length < 1) {
      console.log('no trip id');
      tripId = await sql`
      INSERT INTO trip
        (start_date, session_id)
      VALUES
        (${new Date().toISOString()}, ${sessionId[0].id.toString()})
      RETURNING *
  ;`;

      console.log('newTrip: ', tripId);
    }

    console.log('tripId new: ', tripId);
    tripId = tripId[0].id;

    // Add new waypoint (trip_id and coordinates are unique base on
    // table constraint) -> therefore the try/catch block

    const orderNumber = await getNextOrderNumber(tripId);

    console.log('orderNumber: ', orderNumber);
    let newWaypoint;

    try {
      newWaypoint = await sql`
      INSERT INTO waypoint
        (trip_id, longitude, latitude, order_number, waypoint_name)
      VALUES
        (${tripId}, ${longitude}, ${latitude}, ${orderNumber}, ${waypointName})
      RETURNING *;
    `;
    } catch (event) {
      console.log('event: ', event);
      newWaypoint = [];
    }

    console.log('new waypoint: ', newWaypoint);

    newWaypoint = newWaypoint.map((currentWaypoint: waypointDBType) => {
      console.log('camel case: ', camelcaseKeys(currentWaypoint));
      return camelcaseKeys(currentWaypoint);
    });

    // handle case if no new waypoint was set because already available!
    console.log('newpoint last: ', newWaypoint);
    return newWaypoint[0];
  }
}

export async function deleteWaypoint(waypointId: number) {
  console.log('DB deleted waypoint');

  const deletedWaypoint = await sql`
    DELETE FROM waypoint
    WHERE id = ${waypointId}
    RETURNING *;
    ;
  `;
  console.log('deletedWaypoint: ', deletedWaypoint[0]);

  return deletedWaypoint[0];
}

export async function getSessionIdByToken(token: String) {
  console.log('getSessionIdByToken: ');
  console.log('token: ', token);

  const sessionId = await sql`
      SELECT id
      FROM session
      WHERE token = ${token};
    `;

  console.log('sessionId: ', sessionId.slice(-2));

  return camelcaseKeys(sessionId.slice(-2));
}

//Todo -> updates a moved waypoint on the card or updates the order of the list of waypoints
// Needs to be adopted so that multiple values can be updated in the DB
// Needs to be able to update the order
export async function updateWaypoints(waypoints: waypointDBType[]) {
  console.log('udpate waypoints db');

  const updatedWaypoints = waypoints.map(async (waypoint) => {
    return await sql`
    UPDATE waypoint
    SET
      longitude = ${waypoint.longitude},
      latitude = ${waypoint.latitude},
      order_number = ${waypoint.orderNumber}
    where id = ${waypoint.id}
    RETURNING *;
  `;
  });

  console.log('updatedWaypoints: ', updatedWaypoints);
}

async function getNextOrderNumber(tripId: number) {
  let lastOrderNumber = await sql`
  SELECT max(order_number)
  FROM waypoint
  WHERE trip_id = ${tripId};
  `;

  console.log('lasterOrderNumber: ', lastOrderNumber[0].max);
  lastOrderNumber = lastOrderNumber[0].max;
  lastOrderNumber = !lastOrderNumber
    ? (lastOrderNumber = 1)
    : lastOrderNumber + 1;

  return lastOrderNumber;
}

module.exports = {
  createUser,
  deleteAllExpiredSessions,
  createSessionFiveMinutes,
  createSessionTwoHours,
  createSessionTwentyFourHours,
  getCurrentWaypoints,
  setNewWaypoint,
  deleteWaypoint,
  updateWaypoints,
};
