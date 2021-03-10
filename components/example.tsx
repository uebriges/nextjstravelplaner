import 'mapbox-gl/dist/mapbox-gl.css';
import React, { useCallback, useRef, useState } from 'react';
import ReactMapGL from 'react-map-gl';
import Geocoder from 'react-map-gl-geocoder';
import 'react-map-gl-geocoder/dist/mapbox-gl-geocoder.css';
import { HomeType } from '../pages';

// Ways to set Mapbox token: https://uber.github.io/react-map-gl/#/Documentation/getting-started/about-mapbox-tokens

const Example = (props: HomeType) => {
  const [viewport, setViewport] = useState({
    latitude: 37.7577,
    longitude: -122.4376,
    zoom: 8,
  });
  const mapRef = useRef();
  const handleViewportChange = useCallback(
    (newViewport) => setViewport(newViewport),
    [],
  );

  // if you are happy with Geocoder default settings, you can just use handleViewportChange directly
  const handleGeocoderViewportChange = useCallback((newViewport) => {
    console.log('new Viewport: ', newViewport);
    const geocoderDefaultOverrides = { transitionDuration: 1000 };

    return handleViewportChange({
      ...newViewport,
      ...geocoderDefaultOverrides,
    });
  }, []);

  return (
    <div style={{ height: '100vh' }}>
      <ReactMapGL
        ref={mapRef}
        {...viewport}
        width="100%"
        height="100%"
        onViewportChange={handleViewportChange}
        mapboxApiAccessToken={props.mapboxToken}
      >
        <Geocoder
          mapRef={mapRef}
          onViewportChange={handleGeocoderViewportChange}
          mapboxApiAccessToken={props.mapboxToken}
          position="top-left"
          collapsed={true}
          marker={true}
          //render -> Renders HTML into result -> use for add and mark as favorite
        />
      </ReactMapGL>
    </div>
  );
};

export default Example;

export function getServerSideProps() {
  return { props: { mapboxToken: process.env.MAPBOX_API_TOKEN || null } };
}
