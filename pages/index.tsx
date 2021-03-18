/** @jsxImportSource @emotion/react */
import 'next';
import Head from 'next/head';
import TravelPlaner from './travelplaner';

export default function Home() {
  return (
    <div>
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
        <link
          href="https://api.mapbox.com/mapbox-gl-js/v2.1.1/mapbox-gl.css"
          rel="stylesheet"
        />
      </Head>

      <main>
        <TravelPlaner />
      </main>
    </div>
  );
}
