import { ApolloServer, gql, makeExecutableSchema } from 'apollo-server-micro';
import argon2 from 'argon2';
import postgres from 'postgres';
import {
  createCsrfToken,
  doesPasswordMatchPasswordHash,
} from '../../utils/auth';
import { serializeSecureCookieServerSide } from '../../utils/cookies';
import {
  createSessionTwentyFourHours,
  deleteWaypoint,
  getCurrentWaypoints,
  getUserByUserName,
  getUserTrips,
  registerUser,
  setNewWaypoint,
  updateSessionOfCorrespondingTrip,
  updateWaypoints,
  userNameExists,
} from '../../utils/database';

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

const typeDefs = gql`
  type Query {
    trip: [Trip]
    user(userName: String): User
    waypoints(token: String): [Waypoint]
    getUserTrips(userId: Int): [Trip]
  }
  type Mutation {
    registerUser(user: UserRegisterInput): User
    setNewWaypoint(
      token: String!
      longitude: String!
      latitude: String!
      waypointName: String!
    ): Waypoint
    updateWaypoints(waypoints: [WaypointInput]!): Waypoint
    deleteWaypoint(waypointId: Int!): Waypoint
    loginUser(user: UserLoginInput): LoginResult
    updateSessionOfCorrespondingTrip(sessions: UpdateSessionInput): [String]
  }

  type LoginResult {
    user: User
    tokens: TokenAndCSRF
  }

  type TokenAndCSRF {
    token: String
    csrf: String
  }

  input UpdateSessionInput {
    currentToken: String!
    newToken: String
  }

  input UserRegisterInput {
    username: String
    firstName: String
    lastName: String
    email: String
    password: String
  }

  input UserLoginInput {
    username: String
    password: String
    sessionToken: String
    csrfToken: String
  }

  input WaypointInput {
    id: Int
    tripId: ID
    notes: String
    meansOfTransport: String
    visaInformation: String
    favorite: Boolean
    longitude: String
    latitude: String
    waypointName: String
    orderNumber: Int
  }

  type Trip {
    id: Int
    title: String
    start: String
    end: String
    notes: String
    locations: Waypoint
  }

  type Waypoint {
    id: Int
    tripId: ID
    notes: String
    meansOfTransport: String
    visaInformation: String
    favorite: Boolean
    longitude: String
    latitude: String
    waypointName: String
    orderNumber: Int
  }

  type User {
    id: Int
    firstName: String
    lastName: String
    email: String
    homeCoordinates: String
    currentlyTraveling: Boolean
    userName: String
    trips: [Trip]
  }
`;

const resolvers = {
  Query: {
    user(root, { userName }) {
      return { userName };
    },
    waypoints(root, args) {
      console.log('args.token: ', args.token);
      return getCurrentWaypoints(args.token);
    },
    getUserTrips(root, { userId }) {
      return getUserTrips(userId);
    },
  },
  Mutation: {
    async registerUser(root, args) {
      const userData = args.user;

      // User exists already
      if (await userNameExists(userData.userName)) {
        return { id: 0 };
      }

      console.log('userData.password: ', userData.password);
      // User doesn't exist
      const passwordHash = await argon2.hash(userData.password);
      const newUser = await registerUser({
        id: 0, // doesn't matter, because new id is given by DB
        username: userData.username,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        homeCoordinates: '',
        currentlyTraveling: false,
        password: passwordHash,
      });

      return newUser;
    },
    async loginUser(root, args, context) {
      const { user } = args;

      console.log('user in graphql: ', user);
      // Check CSRF token
      // if (!doesCsrfTokenMatchSessionToken(user.csrfToken, user.sessionToken)) {
      //   throw new Error('CSRF Token does not match');
      // }

      // Search for user in DB
      const userWithPasswordHash = await getUserByUserName(user.username);

      console.log('user with passwordhas: ', userWithPasswordHash);

      // Error out if the username does not exist
      if (userWithPasswordHash[0].id === 0) {
        throw new Error('Username or password does not match');
      }

      // Check if password is correct
      const { passwordHash, ...foundUser } = userWithPasswordHash[0];
      const passwordMatches = await doesPasswordMatchPasswordHash(
        user.password,
        passwordHash,
      );

      // Error out if the password does not match the hash
      if (!passwordMatches) {
        throw new Error('Username or password does not match');
      }

      console.log('user.id: ', foundUser.id);
      // // At this point, we are  successfully authenticated
      const session = await createSessionTwentyFourHours(foundUser.id);

      console.log('session1: ', session);

      await updateSessionOfCorrespondingTrip(
        user.sessionToken, // current token
        session[0].token, // new token
      );

      console.log('session2: ', session);

      const sessionCookie = serializeSecureCookieServerSide(
        'session',
        session[0].token,
      );

      console.log('session cookie: ', sessionCookie);

      context.res.setHeader('Set-Cookie', sessionCookie);

      const newCsrfToken = createCsrfToken(session[0].token);

      return {
        user: foundUser,
        tokens: { token: session[0].token, csrf: newCsrfToken },
      };
    },
    setNewWaypoint(root, args) {
      return setNewWaypoint(
        args.token,
        args.longitude,
        args.latitude,
        args.waypointName,
      );
    },
    updateWaypoints(root, args) {
      // console.log('updateWaypoints gql: ', updateWaypoints);
      // console.log('updated waypoints asdf:');
      // const resvoledResult = updateWaypoints(args.waypoints);
      return updateWaypoints(args.waypoints);
    },
    deleteWaypoint(root, args) {
      return deleteWaypoint(args.waypointId);
    },
    async updateSessionOfCorrespondingTrip(root, args, context) {
      console.log('update update: ', args);
      const newSessionToken = await updateSessionOfCorrespondingTrip(
        args.sessions.currentToken,
        args.sessions.newToken,
      );

      const newSessionCookie = serializeSecureCookieServerSide(
        'session',
        newSessionToken,
      );

      // New session cookie needs also a new csrf token
      const newCsrfToken = createCsrfToken(newSessionCookie);

      context.res.setHeader('Set-Cookie', newSessionCookie);
      return [newSessionToken, newCsrfToken];
    },
  },
};

export const schema = makeExecutableSchema({ typeDefs, resolvers });

export const config = {
  api: { bodyParser: false },
};

export default new ApolloServer({
  schema,
  context: ({ req, res }) => {
    return {
      cookies: req.cookies,
      res,
    };
  },
  // formatResponse: (response, requestContext) => {
  //   // console.log('response in formatResponse: ', response);
  //   console.log('');
  //   // console.log(
  //   //   'requestContext in formatResponse: ',
  //   //   requestContext.context.res,
  //   // );

  //   // requestContext.context.res.set('set-cookie', ['key1=value1', 'key2=value2']);
  //   return response!;
  // },
}).createHandler({
  path: '/api/graphql',
});
