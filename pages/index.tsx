/** @jsxImportSource @emotion/react */
import 'next';
import { GetServerSidePropsContext } from 'next';
import Head from 'next/head';
import { useCallback, useRef, useState } from 'react';
import Example from '../components/example';

// Create the parameters for the routing request:

// const DynamicComponentWithNoSSR = dynamic(() => import('../components/Map'), {
//   ssr: false,
// });

// const dynamicComponent = () => <DynamicComponentWithNoSSR />;
// export default dynamicComponent;

type ViewportType = {
  width: string;
  height: string;
  latitude: number;
  longitude: number;
  zoom: number;
};

export type HomeType = {
  mapboxToken: string;
};

export default function Home(props: HomeType) {
  const [viewport, setViewport] = useState({
    width: '100vw',
    height: '100vh',
    latitude: 48.8685,
    longitude: 2.328549,
    zoom: 15,
  });
  const mapRef = useRef();
  const handleViewportChange = useCallback(
    (newViewport) => setViewport(newViewport),
    [],
  );

  return (
    <div>
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
        <link
          href="https://api.mapbox.com/mapbox-gl-js/v2.1.1/mapbox-gl.css"
          rel="stylesheet"
        />
        {/* <link
          href="https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v4.2.0/mapbox-gl-geocoder.css"
          rel="stylesheet"
        /> */}
      </Head>

      <main>
        <Example mapboxToken={props.mapboxToken} />
      </main>
    </div>
  );
}

export function getServerSideProps(ctx: GetServerSidePropsContext) {
  return {
    props: {
      mapboxToken: process.env.MAPBOX_API_TOKEN || null,
      cookies: ctx.req.cookies.route || null,
    },
  };
}
