import { Button } from '@material-ui/core';
import Cookies from 'js-cookie';
import 'mapbox-gl/dist/mapbox-gl.css';
import { GetServerSidePropsContext } from 'next';
import React, { useCallback, useRef, useState } from 'react';
import ReactMapGL, { Popup } from 'react-map-gl';
import Geocoder from 'react-map-gl-geocoder';
import 'react-map-gl-geocoder/dist/mapbox-gl-geocoder.css';
import { HomeType } from '../pages';
import Route from './Route';

// Ways to set Mapbox token: https://uber.github.io/react-map-gl/#/Documentation/getting-started/about-mapbox-tokens

type CoordinatesType = {
  longitude: number;
  latitude: number;
};

const Example = (props: HomeType) => {
  const [viewport, setViewport] = useState({
    latitude: 38.899826,
    longitude: -77.023041,
    zoom: 13,
  });
  const [currentLatitude, setCurrentLatitude] = useState(38.899826);
  const [currentLongitude, setCurrentLongitude] = useState(-77.023041);

  const mapRef = useRef(null);
  const geoCoderContainerRef = useRef(null);

  const handleViewportChange = useCallback(
    (newViewport) => setViewport(newViewport),
    [],
  );

  // if you are happy with Geocoder default settings, you can just use handleViewportChange directly
  const handleGeocoderViewportChange = useCallback(
    (newViewport) => {
      // setViewport({
      //   latitude: newViewport.latitude,
      //   longitude: newViewport.longitude,
      //   zoom: 8,
      // });
      setCurrentLatitude(newViewport.latitude.toFixed(2));
      setCurrentLongitude(newViewport.longitude.toFixed(2));

      const geocoderDefaultOverrides = { transitionDuration: 1000 };

      return handleViewportChange({
        ...newViewport,
        ...geocoderDefaultOverrides,
      });
    },
    [handleViewportChange],
  );

  const [showPopup, togglePopup] = useState(false);

  // Adds new coordinates to the local storage or cookies
  function addCoordinatesToRoute() {
    let cookiesContent = [];
    let alreadyAvailableCoordinatesInCookies;
    console.log('add coordinates');

    // Search for coordinates in local storage
    if (Cookies.get('route')) {
      console.log('route exists');

      cookiesContent = Cookies.getJSON('route');
      alreadyAvailableCoordinatesInCookies = cookiesContent.find(
        (coordinates: CoordinatesType) =>
          coordinates.longitude === currentLongitude &&
          coordinates.latitude === currentLatitude,
      );
    }

    // If not in local storage yet, add the new coordinates
    if (!alreadyAvailableCoordinatesInCookies) {
      console.log('already available');
      Cookies.set('route', [
        ...cookiesContent,
        { longitude: currentLongitude, latitude: currentLatitude },
      ]);
    }
  }

  return (
    <div style={{ height: '100vh' }}>
      <div
        ref={geoCoderContainerRef}
        style={{ position: 'absolute', top: 20, left: 20, zIndex: 1 }}
      />

      <ReactMapGL
        {...viewport}
        ref={mapRef}
        width="100%"
        height="100%"
        onViewportChange={handleViewportChange}
        mapboxApiAccessToken={props.mapboxToken}
      >
        <Route
          points={[
            { longitude: 38.911488, latitude: -77.042886 },
            { longitude: 38.91085, latitude: -77.036041 },
          ]}
        />
        {currentLatitude && currentLongitude ? (
          <Popup
            latitude={Number(currentLatitude)}
            longitude={Number(currentLongitude)}
            closeButton={true}
            closeOnClick={true}
            onClose={() => togglePopup(false)}
            anchor="top"
          >
            <div>
              You are <strong>here</strong>
              <br />
              <Button
                variant="contained"
                color="primary"
                onClick={addCoordinatesToRoute}
              >
                Add to route
              </Button>
            </div>
          </Popup>
        ) : null}
        <Geocoder
          mapRef={mapRef}
          onViewportChange={handleGeocoderViewportChange}
          mapboxApiAccessToken={props.mapboxToken}
          position="top-left"
          collapsed={true}
          marker={true}
          containerRef={geoCoderContainerRef}
          //render -> Renders HTML into result -> use for add and mark as favorite
        />
      </ReactMapGL>
    </div>
  );
};

export default Example;

export function getServerSideProps(ctx: GetServerSidePropsContext) {
  console.log('server side');

  return { props: { mapboxToken: process.env.MAPBOX_API_TOKEN || null } };
}
