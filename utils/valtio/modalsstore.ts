import { proxy } from 'valtio';

export const MODALS = {
  NONE: 'none',
  LOGIN: 'login',
  REGISTER: 'register',
  USERPROFILE: 'userprofile',
  SAVETRIP: 'savetrip',
};

export const INITIALACTION = {
  SAVETRIP: 'savetrip',
};

type ModalsStoreType = {
  activeModal: string;
  initialAction: String;
  activateModal: (modal: string) => void;
  setInitialAction: (action: string) => void;
};

const modalsStore: ModalsStoreType = proxy({
  activeModal: '',
  initialAction: '',
  activateModal: (modal) => (modalsStore.activeModal = modal),
  setInitialAction: (action) => (modalsStore.initialAction = action),
});

export default modalsStore;
