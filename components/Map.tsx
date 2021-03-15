/** @jsxImportSource @emotion/react */
import { GetServerSidePropsContext } from 'next';
import Head from 'next/head';
import ReactMapGL from 'react-map-gl';

type ViewportType = {
  width: string;
  height: string;
  latitude: number;
  longitude: number;
  zoom: number;
};

type MapProps = {
  viewport: ViewportType;
  setViewport: (viewport: ViewportType) => void;
};

export default function Map(props: MapProps) {
  console.log(process.env.MAPBOX_API_TOKEN);
  return (
    <div>
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <ReactMapGL
          {...props.viewport}
          width="100vw"
          height="100vh"
          mapStyle="mapbox://styles/mapbox/streets-v9"
          mapboxApiAccessToken={process.env.MAPBOX_API_TOKEN}
          onViewportChange={(viewport: ViewportType) =>
            props.setViewport(viewport)
          }
        />
      </main>
    </div>
  );
}

export function getServerSideProps(context: GetServerSidePropsContext) {
  console.log(context);

  return { props: {} };
}
