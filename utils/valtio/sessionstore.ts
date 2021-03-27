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
  setSession: (
    activeSessionType: string,
    activeSessionToken: string,
    tripId?: number,
  ) => void;
  setCSRFToken: (token: string) => void;
};

const sessionStore: SessionStoreType = proxy({
  activeSessionType: '',
  activeSessionToken: '',
  csrfToken: '',
  tripId: undefined,
  setSession: (type, token, tripId) => {
    sessionStore.activeSessionType = type;
    sessionStore.activeSessionToken = token;
    sessionStore.tripId = tripId;
  },
  setCSRFToken: (token) => {
    sessionStore.csrfToken = token;
  },
});

export default sessionStore;
