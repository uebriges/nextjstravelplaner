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
    start: Date
    end: Date
    notes: String
    locations: Location
  }

  type Location {
    id: Int
    tripId: Id
    notes: String
    means_of_transport
    visa_information
    favorite: Boolean
    coordinates: String
  }

  type User {
    id: Int
    firstName: String
    lastName: String
    email: String
    homeCoordinates: String
    currentlyTraveling: boolean
    userName: String
    trips: [Trip]
  }

  type Mutation {
    createUser(userName: String!, firstName: String, lastName: String, passwordHash: String!): User
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
    // getUser
  },
};

export const config = {
  api: { bodyParser: false },
};

export const schema = makeExecutableSchema({ typeDefs, resolvers });

export default new ApolloServer(
  { schema }.createHandler({ path: 'api/graphql' }),
);
