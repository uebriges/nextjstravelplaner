import { proxy } from 'valtio';

export const SESSIONS = {
  ANONYMOUS: 'anonymous', // Not logged in, not started the login/register process
  DURINGLOGINORREGISTER: 'duringloginorregister', // Started the login/register process
  LOGGEDIN: 'loggedin', // Logged in
};

type SessionStoreType = {
  activeSessionType: string;
  activeSessionToken: string;
  setSession: (activeSessionType: string, activeSessionToken: string) => void;
};

const sessionStore: SessionStoreType = proxy({
  activeSessionType: '',
  activeSessionToken: '',
  setSession: (type, token) => {
    sessionStore.activeSessionType = type;
    sessionStore.activeSessionToken = token;
  },
});

export default sessionStore;
