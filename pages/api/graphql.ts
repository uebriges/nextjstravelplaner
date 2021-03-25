import { ApolloServer, gql, makeExecutableSchema } from 'apollo-server-micro';
import postgres from 'postgres';
import {
  deleteWaypoint,
  getCurrentWaypoints,
  setNewWaypoint,
  updateWaypoints,
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
    createUser(
      userName: String!
      firstName: String
      lastName: String
      passwordHash: String!
    ): User
    setNewWaypoint(
      token: String!
      longitude: String!
      latitude: String!
      waypointName: String!
    ): Waypoint
    updateWaypoints(waypoints: [WaypointInput]!): Waypoint
    deleteWaypoint(waypointId: Int!): Waypoint
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
    createUser(root, args) {
      return createUser(
        args.userName,
        args.firstName,
        args.lastName,
        args.passwordHash,
      );
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
