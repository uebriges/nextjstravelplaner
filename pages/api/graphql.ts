import {
  ApolloServer,
  gql,
  IResolvers,
  makeExecutableSchema,
} from 'apollo-server-micro';
import argon2 from 'argon2';
import {
  createCsrfToken,
  doesCsrfTokenMatchSessionToken,
  doesPasswordMatchPasswordHash,
} from '../../utils/auth';
import { serializeSecureCookieServerSide } from '../../utils/cookies';
import {
  createSessionTwentyFourHours,
  deleteSessionByToken,
  deleteWaypoint,
  getCurrentWaypoints,
  getSessionIdByToken,
  getUserByUserName,
  getUserTrips,
  registerUser,
  saveUserTrip,
  setNewWaypoint,
  startNewTrip,
  switchToAnotherTrip,
  updateSessionOfCorrespondingTrip,
  updateWaypoints,
  userNameExists,
} from '../../utils/database';

const typeDefs = gql`
  type Query {
    trip: [Trip]
    user(userName: String): User
    waypoints(token: String): [Waypoint]
    getUserTrips(userId: Int): [Trip]
    getSessionIdByToken(token: String): Int
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
    deleteSessionByToken(token: String): String
    saveUserTrip(userId: Int, tripId: Int, tripTitle: String): String
    startNewTrip(token: String): Int
    switchToAnotherTrip(currentSessionToken: String, newTripId: String): String
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
    action: String
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
    tripId: Int
    notes: String
    meansOfTransport: String
    visaInformation: String
    favorite: Boolean
    longitude: Float
    latitude: Float
    waypointName: String
    orderNumber: Int
  }

  type Trip {
    id: Int
    title: String
    startDate: String
    endDate: String
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
    longitude: Float
    latitude: Float
    waypointName: String
    orderNumber: Int
  }

  type User {
    id: Int!
    firstName: String
    lastName: String
    email: String
    homeCoordinates: String
    currentlyTraveling: Boolean
    userName: String
    trips: [Trip]
  }
`;

const resolvers: IResolvers = {
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
    async getSessionIdByToken(root, args) {
      console.log('grapql arg: ', args);
      const sessionIdArray = await getSessionIdByToken(args.token);
      console.log(
        'grapql getSessionIdByToken sessionIdArray: ',
        sessionIdArray,
      );
      // console.log('extracted type: ', typeof sessionIdArray[0].id);
      return sessionIdArray.length > 0 ? sessionIdArray[0].id : 0;
    },
  },
  Mutation: {
    async registerUser(root, args) {
      const userData = args.user;

      // User exists already
      const userExists = await userNameExists(userData.username);
      console.log('userExists returned: ', userExists);

      if (userExists) {
        console.log('exists already');
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

      console.log('new User: ', newUser[0]);
      // return newUser[0];
      return { id: newUser[0].id, userName: newUser[0].usersName };
    },
    async loginUser(root, args, context) {
      const { user } = args;

      console.log('user in graphql: ', user);
      // Check CSRF token
      if (!doesCsrfTokenMatchSessionToken(user.csrfToken, user.sessionToken)) {
        throw new Error('CSRF Token does not match');
      }

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
        '', // action which calls this function. Only needed for logout, not here.
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
    async setNewWaypoint(root, args) {
      console.log('set new waypoint resolver');
      const newWaypoint = await setNewWaypoint(
        args.token,
        args.longitude,
        args.latitude,
        args.waypointName,
      );

      console.log('newWaypoint resolver: ', newWaypoint);

      return newWaypoint;
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
      console.log('args: ', args);
      const newSessionToken = await updateSessionOfCorrespondingTrip(
        args.sessions.currentToken,
        args.sessions.action,
        args.sessions.newToken,
      );

      console.log('new Session token: ', newSessionToken);

      const newSessionCookie = serializeSecureCookieServerSide(
        'session',
        newSessionToken,
      );

      // New session cookie needs also a new csrf token
      const newCsrfToken = createCsrfToken(newSessionToken);

      context.res.setHeader('Set-Cookie', newSessionCookie);
      return [newSessionToken, newCsrfToken];
    },
    async deleteSessionByToken(root, args) {
      const deletedSession = await deleteSessionByToken(args.token);
      return deletedSession;
    },
    async saveUserTrip(root, args) {
      console.log('resolver save trip');
      console.log('resolver args', args);
      const savedTrip = await saveUserTrip(
        args.userId,
        args.tripId,
        args.tripTitle,
      );
      console.log('saved trip in resolver: ', savedTrip);
      return savedTrip;
    },
    async startNewTrip(root, args) {
      return startNewTrip(args.token);
    },
    async switchToAnotherTrip(root, args) {
      return switchToAnotherTrip(args.currentSessionToken, args.newTripId);
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
}).createHandler({
  path: '/api/graphql',
});
