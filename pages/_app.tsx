/** @jsxImportSource @emotion/react */
import { BottomNavigation, BottomNavigationAction } from '@material-ui/core';
import LanguageIcon from '@material-ui/icons/Language';
import MailOutlineIcon from '@material-ui/icons/MailOutline';
import PermIdentityIcon from '@material-ui/icons/PermIdentity';
import { AppProps } from 'next/app';
import Head from 'next/head';
import RouteIcon from '../components/RouteIcon';
import '../styles/globals.css';
import { footerStlye } from '../styles/styles';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <link
          href="https://api.mapbox.com/mapbox-gl-js/v2.1.1/mapbox-gl.css"
          rel="stylesheet"
        />
      </Head>
      <Component {...pageProps} />
      <footer css={footerStlye}>
        <BottomNavigation
          showLabels={false}
          style={{ background: 'rgba(229, 231, 235, 0.7)' }}
        >
          <BottomNavigationAction icon={<LanguageIcon />} />
          <BottomNavigationAction icon={<RouteIcon />} />
          <BottomNavigationAction icon={<PermIdentityIcon />} />
          <BottomNavigationAction icon={<MailOutlineIcon />} />
        </BottomNavigation>
      </footer>
    </>
  );
}

export default MyApp;
