import { ApolloServer, gql, makeExecutableSchema } from 'apollo-server-micro';
import argon2 from 'argon2';
import postgres from 'postgres';
import {
  doesCsrfTokenMatchSessionToken,
  doesPasswordMatchPasswordHash,
} from '../../utils/auth';
import { serializeSecureCookieServerSide } from '../../utils/cookies';
import {
  createSessionTwentyFourHours,
  deleteWaypoint,
  getCurrentWaypoints,
  getUserByUserName,
  registerUser,
  setNewWaypoint,
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
    loginUser(user: UserLoginInput): User
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

      // console.log('context: ', context);
      // Check CSRF token
      if (!doesCsrfTokenMatchSessionToken(user.csrfToken, user.sessionToken)) {
        throw new Error('CSRF Token does not match');
      }

      // Search for user in DB
      const userWithPasswordHash = await getUserByUserName(user.username);

      // Error out if the username does not exist
      if (userWithPasswordHash.id === 0) {
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
      // // At this point, we are  successfully authenticated
      const session = await createSessionTwentyFourHours(user.id);

      console.log('session: ', session);

      const sessionCookie = serializeSecureCookieServerSide(
        'session',
        session[0].token,
      );

      console.log('session cookie: ', sessionCookie);

      context.res.setHeader('Set-Cookie', sessionCookie);

      // context.res.send({
      //   user: foundUser,
      // });
      return foundUser;
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
