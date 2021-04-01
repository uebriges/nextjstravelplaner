import { proxy } from 'valtio';

export const SESSIONS = {
  ANONYMOUS: 'anonymous', // Not logged in, not started the login/register process
  DURINGLOGINORREGISTER: 'duringloginorregister', // Started the login/register process
  LOGGEDIN: 'loggedin', // Logged in
};

type SessionStoreType = {
  activeSessionType: string;
  activeSessionToken: string;
  csrfToken: string;
  tripId: number | undefined;
  fallbackSessionToken?: string;
  userId: number;
  setSession: (
    activeSessionType: string,
    activeSessionToken: string,
    tripId?: number,
    // needed if 5 mins session token get's invalid -> Fallback will be the 2 hours token
  ) => void;
  setFallbackSession: () => void;
  setCSRFToken: (token: string) => void;
  setUserId: (userId: number) => void;
  setTripId: (tripId: number) => void;
};

const sessionStore: SessionStoreType = proxy({
  activeSessionType: '',
  activeSessionToken: '',
  csrfToken: '',
  tripId: undefined,
  fallbackSessionToken: '',
  userId: 0,
  setSession: (type, token, tripId) => {
    console.log('set session;');
    console.log('type: ', type);
    console.log('token: ', token);
    sessionStore.activeSessionType = type;
    sessionStore.activeSessionToken = token;
    sessionStore.tripId = tripId;

    console.log(
      'sessionStore.activeSessionType: ',
      sessionStore.activeSessionType,
    );
  },
  setCSRFToken: (token) => {
    sessionStore.csrfToken = token;
  },
  setFallbackSession: () => {
    console.log('set fallback');
    sessionStore.fallbackSessionToken = sessionStore.activeSessionToken;
  },
  setUserId: (userId) => {
    sessionStore.userId = userId;
  },
  setTripId: (tripId) => {
    sessionStore.tripId = tripId;
  },
});

export default sessionStore;
