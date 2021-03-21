/** @jsxImportSource @emotion/react */
import { BottomNavigation, BottomNavigationAction } from '@material-ui/core';
import LanguageIcon from '@material-ui/icons/Language';
import MailOutlineIcon from '@material-ui/icons/MailOutline';
import PermIdentityIcon from '@material-ui/icons/PermIdentity';
import Head from 'next/head';
import { useSnapshot } from 'valtio';
import { footerStlye } from '../styles/styles';
import modalsStore, { MODALS } from '../utils/valtio/modalsstore';
import RouteIcon from './maputils/RouteIcon';
import Login from './modals/Login';
import Register from './modals/Register';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout(props: LayoutProps) {
  const modalStateSnapshot = useSnapshot(modalsStore);

  function handleUserFunctionality(e) {
    modalsStore.activateModal(MODALS.LOGIN);
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
