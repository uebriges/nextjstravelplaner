/** @jsxImportSource @emotion/react */
import 'next';
import Head from 'next/head';
import TravelPlaner from './TravelPlaner';

// const DynamicComponentWithNoSSR = dynamic(() => import('../components/Map'), {
//   ssr: false,
// });

// const dynamicComponent = () => <DynamicComponentWithNoSSR />;
// export default dynamicComponent;

export default function Home() {
  // const [viewport, setViewport] = useState({
  //   width: '100vw',
  //   height: '100vh',
  //   latitude: 48.8685,
  //   longitude: 2.328549,
  //   zoom: 15,
  // });
  // const mapRef = useRef();
  // const handleViewportChange = useCallback(
  //   (newViewport) => setViewport(newViewport),
  //   [],
  // );

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
