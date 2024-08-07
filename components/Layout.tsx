/** @jsxImportSource @emotion/react */
import { useMutation } from '@apollo/client';
import { BottomNavigation, BottomNavigationAction } from '@mui/material';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import PermIdentityIcon from '@mui/icons-material/PermIdentity';
import Head from 'next/head';
import { useSnapshot } from 'valtio';
import { footerStyle, mapStyle } from '../styles/styles';
import { updateSessionOfCorrespondingTrip } from '../utils/graphqlQueries';
import modalsStore, { MODALS } from '../utils/valtio/modalsstore';
import sessionStore, { SESSIONS } from '../utils/valtio/sessionstore';
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
  const [updateSessionOfCorrespondingTripFunction] = useMutation(
    updateSessionOfCorrespondingTrip,
  );

  // Handle click on user symbol
  async function handleUserFunctionality() {
    // If user is already logged in
    if (sessionStoreSnapshot.activeSessionType === SESSIONS.LOGGEDIN) {
      modalStateSnapshot.activateModal(MODALS.USERPROFILE);
      return;
    }

    // If session type is not LOGGEDIN
    if (sessionStoreSnapshot.activeSessionType !== SESSIONS.LOGGEDIN) {
      modalStateSnapshot.activateModal(MODALS.LOGIN);

      // Change session id of trip to 5 mins session token
      const newTokenAndCSRF = await updateSessionOfCorrespondingTripFunction({
        variables: {
          sessions: { currentToken: sessionStoreSnapshot.activeSessionToken },
        },
      });

      // Store fallback + update session token in sessionStore + update csrf
      sessionStoreSnapshot.setFallbackSession();
      sessionStoreSnapshot.setSession(
        SESSIONS.DURINGLOGINORREGISTER,
        newTokenAndCSRF.data.updateSessionOfCorrespondingTrip[0],
      );
      sessionStoreSnapshot.setCSRFToken(
        newTokenAndCSRF.data.updateSessionOfCorrespondingTrip[1],
      );
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
      <main css={mapStyle}>
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
      <footer css={footerStyle}>
        <BottomNavigation
          showLabels={false}
          style={{
            background: 'rgb(61 120 162)',
          }}
        >
          {/* <BottomNavigationAction icon={<LanguageIcon />} /> */}
          <BottomNavigationAction
            icon={<FormatAlignLeftIcon />}
            onClick={handleTripInstructions}
          />
          <BottomNavigationAction
            data-cy="UserProfileBtn"
            icon={<PermIdentityIcon />}
            onClick={handleUserFunctionality}
          />
        </BottomNavigation>
      </footer>
    </>
  );
}
