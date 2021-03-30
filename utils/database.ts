import camelcaseKeys from 'camelcase-keys';
import postgres from 'postgres';
import { UserTripType } from '../components/modals/UserProfile';
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

// ------------------------------------------------------ Session ---------------------------------------------------------------------

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
// - Might need a userId as parameter
export async function createSessionTwentyFourHours(userId: number) {
  const token = generateSession();

  const newSessionTwentyFourHours = await sql`
  INSERT INTO session (
    token, expiry_timestamp, user_id
  )
  VALUES
  (
    ${token},
    NOW() + INTERVAL '24 hours',
    ${userId}
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

export async function deleteSessionById(id: number) {
  const sessions = await sql`
    DELETE FROM
      sessions
    WHERE
      id = ${id}
    RETURNING *
  `;
  return camelcaseKeys(sessions)[0];
}

export async function deleteSessionByToken(token: string) {
  const sessions = await sql`
    DELETE FROM
      sessions
    WHERE
      token = ${token}
    RETURNING *
  `;
  return camelcaseKeys(sessions)[0];
}

export async function getSessionIdByToken(token: String) {
  console.log('getSessionIdByToken: ');
  console.log('token: ', token);

  const sessionId = await sql`
      SELECT id
      FROM session
      WHERE token = ${token};
    `;

  // console.log('sessionId: ', sessionId.slice(-2));

  return camelcaseKeys(sessionId.slice(-2));
}

export async function updateSessionOfCorrespondingTrip(
  currentToken: string,
  action?: string,
  newToken?: string,
) {
  console.log('updateSessionOfCorrespondingTrip');
  console.log('currentToken: ', currentToken);

  let newTokenObject;
  let newTokenId;
  // If new token is needed, because there is no fallback token in sessionStore
  if (!newToken) {
    console.log('no new token');
    // Logout: New token -> 2 hours valid
    // Any other action: 5 mins (e.g. start login process)
    if (action === 'logout') {
      console.log('action logout');
      newTokenObject = await createSessionTwoHours();
      console.log('new token object: ', newTokenObject);
      newToken = newTokenObject.token;
      newTokenId = newTokenObject.id;
    } else {
      console.log('other action');
      newTokenObject = await createSessionFiveMinutes();
      newToken = newTokenObject[0].token;
      newTokenId = newTokenObject[0].id;
    }
  } else {
    console.log('new token given ');
    newTokenId = (
      await sql`
    SELECT id
    FROM session
    WHERE token = ${newToken};
  `
    )[0].id;
  }

  console.log('new token: ', newToken);
  console.log('new token object: ', newTokenObject);

  // Lookup the id of currentToken
  let currentTokenObject = await sql`
    SELECT id
    FROM session
    WHERE token = ${currentToken};
  `;

  // Current token is also in the DB
  if (currentTokenObject.length > 0) {
    const currentTokenId = currentTokenObject[0].id;

    console.log('new token id: ', newTokenId);
    console.log('current token: ', currentTokenId);
    // currentTokenId = currentTokenId[0].id;
    // replace current token id of trip with new token

    await sql`
      UPDATE trip
      SET session_id = ${newTokenId}
      WHERE session_id = ${currentTokenId.toString()};
    `;

    // replace token of current trip with new token
  }

  return newToken;
}

// -------------------------------------------------------------------- Trip planning --------------------------------------------------------

export async function getCurrentWaypoints(token: String) {
  const sessionId = await getSessionIdByToken(token);
  let route = [];
  console.log('sessionId getcurrentwaypoints: ', sessionId);
  if (sessionId.length > 0) {
    console.log('Check for trip+waypoints of specific session id');
    route = await sql`
      SELECT * from trip tripTable
      INNER JOIN trip_waypoint joinTable ON tripTable.id = joinTable.trip_id
      INNER JOIN waypoint waypointTable ON joinTable.waypoint_id=waypointTable.id
      WHERE tripTable.session_id = ${sessionId[0].id.toString()};
    `;

    // console.log('route: ', route);
  }
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

    const orderNumber = await getLastOrderNumber(tripId);

    console.log('orderNumber: ', orderNumber);
    let newWaypoint;

    try {
      newWaypoint = await sql`
      INSERT INTO waypoint
        (longitude, latitude, waypoint_name)
      VALUES
        (${longitude}, ${latitude}, ${waypointName})
      RETURNING *;
    `;

      console.log('newwaypoint: ', newWaypoint[0]);
      newWaypoint = newWaypoint[0];
      const newTripWaypoint = await sql`
        INSERT INTO trip_waypoint
          (trip_id, waypoint_id, order_number)
        VALUES
          (${tripId}, ${newWaypoint.id}, ${orderNumber})
        RETURNING *;
      `;
      newWaypoint = newTripWaypoint;
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

  const deletedWaypointFromTripWaypoint = await sql`
  DELETE FROM trip_waypoint
  WHERE waypoint_id = ${waypointId}
  RETURNING *;
  `;

  const deletedWaypointFromWaypoint = await sql`
    DELETE FROM waypoint
    WHERE id = ${waypointId}
    RETURNING *;
    ;
  `;

  console.log('deletedWaypoint: ', deletedWaypointFromWaypoint[0]);

  return deletedWaypointFromWaypoint[0];
}

// Used for moving waypoints or changing the order of waypoints
export async function updateWaypoints(waypoints: waypointDBType[]) {
  // 1. Update coordinates and waypoint name of moved waypoint
  let sqlQuery =
    'UPDATE waypoint as w SET longitude = w2.longitude, latitude = w2.latitude, waypoint_name = w2.waypoint_name FROM (values  ';
  waypoints.map((waypoint, index, array) => {
    sqlQuery += ` (${waypoint.id}, ${waypoint.longitude}, ${waypoint.latitude}, '${waypoint.waypointName}')`;
    sqlQuery += index === array.length - 1 ? '' : ',';
  });
  sqlQuery +=
    ' ) AS w2(id, longitude, latitude, waypoint_name) WHERE w2.id = w.id RETURNING *;';

  const updatedWayointPosition = await sql.unsafe(sqlQuery);

  // 2. Update order number of waypoints in the list
  sqlQuery =
    'UPDATE trip_waypoint as tw SET order_number = tw2.order_number FROM (values  ';
  waypoints.map((waypoint, index, array) => {
    sqlQuery += ` (${waypoint.id}, ${waypoint.orderNumber})`;
    sqlQuery += index === array.length - 1 ? '' : ',';
  });
  sqlQuery +=
    ' ) AS tw2(id, order_number) WHERE tw2.id = tw.waypoint_id RETURNING *;';

  const updatedWayointOrder = await sql.unsafe(sqlQuery);

  // It is enough to return the first result, because changes are already made in the tables.
  return updatedWayointPosition.map((updatedWaypoint: waypointDBType) => {
    return camelcaseKeys(updatedWaypoint);
  });
}

// Returns the last order number of a waypoints in a specific trip
async function getLastOrderNumber(tripId: number) {
  let lastOrderNumber = await sql`
  SELECT max(order_number)
  FROM trip_waypoint
  WHERE trip_id = ${tripId};
  `;

  console.log('lasterOrderNumber: ', lastOrderNumber[0].max);
  lastOrderNumber = lastOrderNumber[0].max;
  lastOrderNumber = !lastOrderNumber
    ? (lastOrderNumber = 1)
    : lastOrderNumber + 1;

  return lastOrderNumber;
}

// -------------------------------------------------------------------- User related ----------------------------------------------------------------

type UserDBType = {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  homeCoordinates: string;
  currentlyTraveling: boolean;
  password: string;
};

export async function registerUser(user: UserDBType) {
  const newUser = await sql`
    INSERT INTO
      users (
          users_name,
          first_name,
          last_name,
          email,
          password_hash
      )
    VALUES (
      ${user.username}, ${user.firstName}, ${user.lastName}, ${user.email}, ${user.password}
    );
  `;

  return newUser.map((currentUser: UserDBType) => camelcaseKeys(currentUser));
}

// Check if user name exists
export async function userNameExists(username: string) {
  const users = await sql`
    SELECT *
    FROM users
    WHERE users_name = ${username};
  `;

  return users.length !== 0;
}

// Retrieve user by user name
export async function getUserByUserName(username: string) {
  console.log('in getuser call');
  const user = await sql`
    SELECT *
    FROM users
    WHERE users_name = ${username};
  `;

  console.log('tried to get user', user);

  if (user.length !== 0) {
    return user.map((currentUser: UserDBType) => camelcaseKeys(currentUser));
  } else {
    return { id: 0 };
  }
}

export async function getUserTrips(userId: number) {
  const tripsOfUser = await sql`
    SELECT *
    FROM user_trip, trip
    WHERE user_trip.user_id = ${userId}
  `;

  console.log('tripsOfUser db: ', tripsOfUser);

  return tripsOfUser.map((currentTrip: UserTripType) =>
    camelcaseKeys(currentTrip),
  );
}

export async function createUserTrip(userId: number, tripId: number) {
  // await sql`
  //   UPDATE TABLE user_trip
  // `;
}

export async function logoutUser(userId: number) {}

module.exports = {
  deleteAllExpiredSessions,
  createSessionFiveMinutes,
  createSessionTwoHours,
  createSessionTwentyFourHours,
  updateSessionOfCorrespondingTrip,
  getCurrentWaypoints,
  setNewWaypoint,
  deleteWaypoint,
  updateWaypoints,
  registerUser,
  userNameExists,
  getUserByUserName,
  getUserTrips,
  deleteSessionByToken,
};
