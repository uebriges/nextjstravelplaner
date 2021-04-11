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
  if (!globalThis.postgresSql) {
    globalThis.postgresSql = postgres();
  }
  sql = globalThis.postgresSql;
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
export async function createSessionTwentyFourHours(userId) {
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

export async function deleteSessionById(id) {
  const sessions = await sql`
    DELETE FROM
      sessions
    WHERE
      id = ${id}
    RETURNING *
  `;
  return camelcaseKeys(sessions)[0];
}

export async function deleteSessionByToken(token) {
  const sessions = await sql`
    DELETE FROM
      sessions
    WHERE
      token = ${token}
    RETURNING *
  `;
  return camelcaseKeys(sessions)[0];
}

export async function getSessionIdByToken(token) {
  const sessionId = await sql`
      SELECT id
      FROM session
      WHERE token = ${token};
    `;
  return camelcaseKeys(sessionId.slice(-2));
}

export async function updateSessionOfCorrespondingTrip(
  currentToken,
  action,
  newToken,
) {
  let newTokenObject;
  let newTokenId;
  // If new token is needed, because there is no fallback token in sessionStore
  if (!newToken) {
    // Logout: New token -> 2 hours valid
    // Any other action: 5 mins (e.g. start login process)
    if (action === 'logout') {
      newTokenObject = await createSessionTwoHours();
      newToken = newTokenObject.token;
      newTokenId = newTokenObject.id;
    } else {
      newTokenObject = await createSessionFiveMinutes();
      newToken = newTokenObject[0].token;
      newTokenId = newTokenObject[0].id;
    }
  } else {
    newTokenId = (
      await sql`
    SELECT id
    FROM session
    WHERE token = ${newToken};
  `
    )[0].id;
  }

  // Lookup the id of currentToken
  const currentTokenObject = await sql`
    SELECT id
    FROM session
    WHERE token = ${currentToken};
  `;

  // Current token is also in the DB
  if (currentTokenObject.length > 0) {
    const currentTokenId = currentTokenObject[0].id;

    await sql`
      UPDATE trip
      SET session_id = ${newTokenId}
      WHERE session_id = ${currentTokenId.toString()};
    `;
  }

  return newToken;
}

// -------------------------------------------------------------------- Trip planning --------------------------------------------------------

export async function getCurrentWaypoints(token) {
  const sessionId = await getSessionIdByToken(token);
  let route = [];
  if (sessionId.length > 0) {
    route = await sql`
      SELECT * from trip tripTable
      INNER JOIN trip_waypoint joinTable ON tripTable.id = joinTable.trip_id
      INNER JOIN waypoint waypointTable ON joinTable.waypoint_id=waypointTable.id
      WHERE tripTable.session_id = ${sessionId[0].id.toString()}
      ORDER BY joinTable.order_number;
    `;
  }
  return route.map((currentRoute) => camelcaseKeys(currentRoute));
}

// Returns the last order number of a waypoints in a specific trip
async function getLastOrderNumber(tripId) {
  let lastOrderNumber = await sql`
  SELECT max(order_number)
  FROM trip_waypoint
  WHERE trip_id = ${tripId};
  `;

  lastOrderNumber = lastOrderNumber[0].max;
  lastOrderNumber = !lastOrderNumber
    ? (lastOrderNumber = 1)
    : lastOrderNumber + 1;

  return lastOrderNumber;
}

// Set a new waypoint to the map
export async function setNewWaypoint(token, longitude, latitude, waypointName) {
  // Get the session id of the current session
  const sessionId = await getSessionIdByToken(token);

  if (sessionId.length > 0) {
    // Get the tripId to the corresponding sessionId
    let tripId = await sql`
    SELECT id
    FROM trip
    WHERE session_id = ${sessionId[0].id.toString()}
  ;`;

    // If no trip created yet, create a new one
    if (tripId.length < 1) {
      tripId = await sql`
      INSERT INTO trip
        (start_date, session_id)
      VALUES
        (${new Date().toLocaleDateString()}, ${sessionId[0].id.toString()})
      RETURNING *
  ;`;
    }

    tripId = tripId[0].id;

    // Add new waypoint (trip_id and coordinates are unique base on
    // table constraint) -> therefore the try/catch block

    const orderNumber = await getLastOrderNumber(tripId);

    let newWaypoint;

    try {
      newWaypoint = await sql`
      INSERT INTO waypoint
        (longitude, latitude, waypoint_name)
      VALUES
        (${longitude}, ${latitude}, ${waypointName})
      RETURNING *;
    `;

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
      newWaypoint = [];
    }

    newWaypoint = newWaypoint.map((currentWaypoint) => {
      return camelcaseKeys(currentWaypoint);
    });

    // handle case if no new waypoint was set because already available!
    return newWaypoint[0];
  }
}

export async function deleteWaypoint(waypointId) {
  await sql`
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

  return deletedWaypointFromWaypoint[0];
}

// Used for moving waypoints or changing the order of waypoints
export async function updateWaypoints(waypoints) {
  // 1. Update coordinates and waypoint name of moved waypoint
  let sqlQuery =
    'UPDATE waypoint as w SET longitude = w2.longitude, latitude = w2.latitude, waypoint_name = w2.waypoint_name FROM (values  ';
  waypoints.map((waypoint, index, array) => {
    sqlQuery += ` (${waypoint.id}, ${waypoint.longitude}, ${waypoint.latitude}, '${waypoint.waypointName}')`;
    sqlQuery += index === array.length - 1 ? '' : ',';
    return waypoint;
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
    return waypoint;
  });
  sqlQuery +=
    ' ) AS tw2(id, order_number) WHERE tw2.id = tw.waypoint_id RETURNING *;';

  await sql.unsafe(sqlQuery);

  // It is enough to return the first result, because changes are already made in the tables.
  return updatedWayointPosition.map((updatedWaypoint) => {
    return camelcaseKeys(updatedWaypoint);
  });
}

// -------------------------------------------------------------------- User related ----------------------------------------------------------------

export async function registerUser(user) {
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
    )
    RETURNING *;
  `;

  return newUser.map((currentUser) => camelcaseKeys(currentUser));
}

// Check if user name exists
export async function userNameExists(username) {
  const users = await sql`
SELECT *
FROM users
WHERE users_name = ${username};
  `;

  return users.length > 0;
}

// Retrieve user by user name
export async function getUserByUserName(username) {
  const user = await sql`
SELECT *
FROM users
WHERE users_name = ${username};
  `;

  if (user.length !== 0) {
    return user.map((currentUser) => camelcaseKeys(currentUser));
  } else {
    return { id: 0 };
  }
}

export async function getUserTrips(userId) {
  const tripsOfUser = await sql`
    SELECT DISTINCT id, title, start_date, end_date
    FROM user_trip userTripTable
		INNER JOIN trip tripTable ON userTripTable.trip_id = tripTable.id
    WHERE userTripTable.user_id = ${userId}
    AND title IS NOT NULL;
  `;

  console.log('getUserTrips tripsOfUser: ', tripsOfUser);
  console.log(
    'getUserTrips tripsOfUser typeof date: ',
    typeof tripsOfUser[0].start_date,
  );

  return tripsOfUser.map((currentTrip) => {
    return camelcaseKeys(currentTrip);
  });
}

export async function saveUserTrip(userId, tripId, tripTitle) {
  await sql`
    INSERT INTO user_trip
    VALUES (${tripId},${userId}) ON CONFLICT (trip_id, user_id) DO NOTHING;
  `;

  await sql`
  UPDATE trip
  SET title = ${tripTitle}
  WHERE id = ${tripId};
`;

  return 'Saved trip';
}

export async function startNewTrip(token) {
  // get session id
  const sessionId = await sql`
    SELECT id
    FROM session
    WHERE token = ${token};
  `;

  // remove session_id where session_id = sessionId
  await sql`
    UPDATE trip
    SET session_id = ''
    WHERE session_id = ${sessionId[0].id.toString()}
  `;

  // create a new tripId with sessionId
  const newTrip = await sql`
    INSERT INTO trip
    (session_id, start_date)
    VALUES (${sessionId[0].id.toString()}, ${Date.now().toLocaleDateString()})
    RETURNING id
  `;

  return camelcaseKeys(newTrip[0].id);
}

export async function switchToAnotherTrip(currentSessionToken, newTripId) {
  // get session id
  const sessionId = await sql`
    SELECT id
    FROM session
    WHERE token = ${currentSessionToken};
  `;

  // remove session_id where session_id = sessionId
  await sql`
    UPDATE trip
    SET session_id = ''
    WHERE session_id = ${sessionId[0].id.toString()}
  `;

  await sql`
    UPDATE trip
    SET session_id = ${sessionId[0].id.toString()}
    WHERE id = ${newTripId};`;

  return 'switched to tripId: ' + newTripId;
}

export async function getCurrentTripIdByToken(token) {
  const tokenId = await getSessionIdByToken(token);
  let tripId;

  if (tokenId.length > 0) {
    tripId = await sql`
    SELECT id
    FROM trip
    WHERE session_id = ${tokenId[0].id.toString()}
  `;
  }

  return !tripId ? null : camelcaseKeys(tripId)[0].id;
}

export async function isCurrentTokenLoggedIn(token) {
  const userId = await sql`
    SELECT user_id
    FROM session
    WHERE token= ${token};
  `;

  const result = userId.map((currentUserId) => camelcaseKeys(currentUserId));
  const isLoggedIn = result.length < 1 || !result[0].userId ? false : true;

  return isLoggedIn;
}

export async function getUserIdBytoken(token) {
  const userId = await sql`
    SELECT user_id
    FROM session
    WHERE token = ${token}
  `;

  return camelcaseKeys(userId)[0].userId;
}
