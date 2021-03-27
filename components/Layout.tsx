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
import RouteIcon from './maputils/RouteIcon';
import Login from './modals/Login';
import Register from './modals/Register';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout(props: LayoutProps) {
  const sessionStoreSnapshot = useSnapshot(sessionStore, { sync: true });
  const modalStateSnapshot = useSnapshot(modalsStore);
  const [updateSessionOfCorrespondingTrip] = useMutation(
    graphqlQueries.updateSessionOfCorrespondingTrip,
  );

  async function handleUserFunctionality(e) {
    modalsStore.activateModal(MODALS.LOGIN);
    console.log('handleUserFunctionality');
    console.log('sessionStoreSnapshot before: ', sessionStoreSnapshot);

    // If session type is not DURINGLOGINORREGISTER or not LOGGEDIN
    if (
      sessionStoreSnapshot.activeSessionType !==
        SESSIONS.DURINGLOGINORREGISTER &&
      sessionStoreSnapshot.activeSessionType !== SESSIONS.LOGGEDIN
    ) {
      console.log('token not yet 5 mins');

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
          <BottomNavigationAction icon={<RouteIcon />} />
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
