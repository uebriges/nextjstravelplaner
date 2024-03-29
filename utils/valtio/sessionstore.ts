import { proxy } from 'valtio';

/* eslint-disable-next-line */
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
  setSession: (type, token) => {
    sessionStore.activeSessionType = type;
    sessionStore.activeSessionToken = token;
  },
  setCSRFToken: (token) => {
    sessionStore.csrfToken = token;
  },
  setFallbackSession: () => {
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
