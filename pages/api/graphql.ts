import { ApolloServer, gql, makeExecutableSchema } from 'apollo-server-micro';
import postgres from 'postgres';
import { createUser } from '../../utils/database';

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
  type Trip {
    title: String
    start: String
    end: String
    notes: String
    locations: Location
  }

  type Location {
    id: Int
    tripId: ID
    notes: String
    means_of_transport: String
    visa_information: String
    favorite: Boolean
    coordinates: String
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

  type Mutation {
    createUser(
      userName: String!
      firstName: String
      lastName: String
      passwordHash: String!
    ): User
  }

  type Query {
    trip: [trip]
    user(username: string): User
  }
`;

const resolvers = {
  Mutation: {
    createUser(root, args) {
      return createUser(
        args.userName,
        args.firstName,
        args.lastName,
        args.passwordHash,
      );
    },
    // create User
  },
  Query: {
    user(root, args) {
      return 'asdf';
    },
  },
};

export const config = {
  api: { bodyParser: false },
};

export const schema = makeExecutableSchema({ typeDefs, resolvers });

export default new ApolloServer({ schema }).createHandler({
  path: 'api/graphql',
});
