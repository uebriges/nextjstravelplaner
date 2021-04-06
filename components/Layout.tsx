/** @jsxImportSource @emotion/react */
import { useMutation } from '@apollo/client';
import { BottomNavigation, BottomNavigationAction } from '@material-ui/core';
import LanguageIcon from '@material-ui/icons/Language';
import MailOutlineIcon from '@material-ui/icons/MailOutline';
import PermIdentityIcon from '@material-ui/icons/PermIdentity';
import Head from 'next/head';
import { useSnapshot } from 'valtio';
import { footerStlye } from '../styles/styles';
import graphqlQueries from '../utils/graphqlQueries';
import modalsStore, { MODALS } from '../utils/valtio/modalsstore';
import sessionStore, { SESSIONS } from '../utils/valtio/sessionstore';
import RouteIcon from './map/RouteIcon';
import Login from './modals/Login';
import Register from './modals/Register';
import SaveTrip from './modals/SaveTrip';
import TripInstructions from './modals/TripInstructions';
import UserProfile from './modals/UserProfile';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout(props: LayoutProps) {
  const sessionStoreSnapshot = useSnapshot(sessionStore, { sync: true });
  const modalStateSnapshot = useSnapshot(modalsStore);
  const [updateSessionOfCorrespondingTrip] = useMutation(
    graphqlQueries.updateSessionOfCorrespondingTrip,
  );

  // Handle click on user symbol
  async function handleUserFunctionality(e) {
    console.log('session type: ', sessionStoreSnapshot.activeSessionType);
    console.log('modal type: ', modalsStore.activeModal);
    // If user is already logged in
    if (sessionStoreSnapshot.activeSessionType === SESSIONS.LOGGEDIN) {
      modalStateSnapshot.activateModal(MODALS.USERPROFILE);
      return;
    }

    console.log('handleUserFunctionality');
    console.log('sessionStoreSnapshot before: ', sessionStoreSnapshot);

    // If session type is not LOGGEDIN
    if (sessionStoreSnapshot.activeSessionType !== SESSIONS.LOGGEDIN) {
      console.log('token not yet 5 mins');
      modalStateSnapshot.activateModal(MODALS.LOGIN);

      // Change session id of trip to 5 mins session token
      const newTokenAndCSRF = await updateSessionOfCorrespondingTrip({
        variables: {
          sessions: { currentToken: sessionStoreSnapshot.activeSessionToken },
        },
      });

      console.log('newTokenAndCSRF: ', newTokenAndCSRF);

      console.log('csrf: ', sessionStoreSnapshot.csrfToken);
      console.log(
        'csrf should be afterwards: ',
        newTokenAndCSRF.data.updateSessionOfCorrespondingTrip[1],
      );

      // Store fallback + update session token in sessionStore + update csrf
      sessionStoreSnapshot.setFallbackSession();
      sessionStoreSnapshot.setSession(
        SESSIONS.DURINGLOGINORREGISTER,
        newTokenAndCSRF.data.updateSessionOfCorrespondingTrip[0],
      );
      sessionStoreSnapshot.setCSRFToken(
        newTokenAndCSRF.data.updateSessionOfCorrespondingTrip[1],
      );

      console.log('sessionStoreSnapshot: ', sessionStoreSnapshot);

      //If 5 mins are over, fallback to 2 hours session token -> change session_id of trip again
    }
  }

  function handleTripInstructions() {
    modalStateSnapshot.activateModal(MODALS.TRIPINSTRUCTIONS);
  }

  return (
    <>
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
        <link
          href="https://api.mapbox.com/mapbox-gl-js/v2.1.1/mapbox-gl.css"
          rel="stylesheet"
        />
      </Head>
      <main>
        {modalStateSnapshot.activeModal === MODALS.LOGIN ? <Login /> : null}
        {modalStateSnapshot.activeModal === MODALS.REGISTER ? (
          <Register />
        ) : null}
        {modalStateSnapshot.activeModal === MODALS.USERPROFILE ? (
          <UserProfile />
        ) : null}
        {modalStateSnapshot.activeModal === MODALS.SAVETRIP ? (
          <SaveTrip />
        ) : null}
        {modalStateSnapshot.activeModal === MODALS.TRIPINSTRUCTIONS ? (
          <TripInstructions />
        ) : null}
        {props.children}
      </main>
      <footer css={footerStlye}>
        <BottomNavigation
          showLabels={false}
          style={{
            background: 'rgba(229, 231, 235, 0.7)',
          }}
        >
          <BottomNavigationAction icon={<LanguageIcon />} />
          <BottomNavigationAction
            icon={<RouteIcon />}
            onClick={handleTripInstructions}
          />
          <BottomNavigationAction
            icon={<PermIdentityIcon />}
            onClick={handleUserFunctionality}
          />
          <BottomNavigationAction icon={<MailOutlineIcon />} />
        </BottomNavigation>
      </footer>
    </>
  );
}
