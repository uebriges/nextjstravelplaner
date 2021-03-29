import { proxy } from 'valtio';

export const MODALS = {
  NONE: 'none',
  LOGIN: 'login',
  REGISTER: 'register',
  USERPROFILE: 'userprofile',
};

type ModalsStoreType = {
  activeModal: string;
  activateModal: (modal: string) => void;
};

const modalsStore: ModalsStoreType = proxy({
  activeModal: '',
  activateModal: (modal) => (modalsStore.activeModal = modal),
});

export default modalsStore;
