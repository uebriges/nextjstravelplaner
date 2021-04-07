import LoginUserTest from '../e2eHelper/e2eLoginUser.spec';
import RegisterUserTest from '../e2eHelper/e2eRegisterUser.spec';
import CreateNewTrip from './createTrip.spec';
import SaveTrip from './e2eSaveTrip.spec';
import StartNewTrip from './e2eStartNewTrip.spec';
import SwitchToAnotherTrip from './switchToAnotherTrip.spec';

describe('Complete registration and login cycle ', () => {
  context('Register and loing a user', () => {
    RegisterUserTest();
    LoginUserTest();
    CreateNewTrip();
    SaveTrip('My first trip');
    StartNewTrip();
    SaveTrip('My second trip');
    SwitchToAnotherTrip();
  });
});
