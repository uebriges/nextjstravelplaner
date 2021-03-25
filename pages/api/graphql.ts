import { ApolloServer, gql, makeExecutableSchema } from 'apollo-server-micro';
import argon2 from 'argon2';
import postgres from 'postgres';
import {
  deleteWaypoint,
  getCurrentWaypoints,
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
    registerUser(user: UserInput): User
    setNewWaypoint(
      token: String!
      longitude: String!
      latitude: String!
      waypointName: String!
    ): Waypoint
    updateWaypoints(waypoints: [WaypointInput]!): Waypoint
    deleteWaypoint(waypointId: Int!): Waypoint
  }

  input UserInput {
    userName: String
    firstName: String
    lastName: String
    email: String
    password: String
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

      // User doesn't exist
      const passwordHash = await argon2.hash(userData.password);
      const newUser = await registerUser({
        id: 0, // doesn't matter, because new id is given by DB
        username: userData.userName,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        homeCoordinates: '',
        currentlyTraveling: false,
        password: passwordHash,
      });

      return newUser;
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

export default new ApolloServer({ schema }).createHandler({
  path: '/api/graphql',
});
