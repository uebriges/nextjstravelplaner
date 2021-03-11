import { Button } from '@material-ui/core';
import 'mapbox-gl/dist/mapbox-gl.css';
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
    latitude: 37.7577,
    longitude: -122.4376,
    zoom: 8,
  });
  const [currentLatitude, setCurrentLatitude] = useState(37.78);
  const [currentLongitude, setCurrentLongitude] = useState(-122.41);

  const mapRef = useRef();

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

      console.log('after setting');
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
    let localStorageContent = [];
    let alreadyAvailableCoordinatesInLocalStorage;

    // Search for coordinates in local storage
    if (localStorage.getItem('route')) {
      localStorageContent = JSON.parse(localStorage.getItem('route') as string);
      alreadyAvailableCoordinatesInLocalStorage = localStorageContent.find(
        (coordinates: CoordinatesType) =>
          coordinates.longitude === currentLongitude &&
          coordinates.latitude === currentLatitude,
      );
    }

    // If not in local storage yet, add the new coordinates
    if (!alreadyAvailableCoordinatesInLocalStorage) {
      localStorage.setItem(
        'route',
        JSON.stringify([
          ...localStorageContent,
          { longitude: currentLongitude, latitude: currentLatitude },
        ]),
      );
    }
  }

  return (
    <div style={{ height: '100vh' }}>
      <ReactMapGL
        {...viewport}
        ref={mapRef}
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
        <Route
          points={[
            [-76.987471, 38.845286],
            [-76.987469, 38.845219],
          ]}
        />
      </ReactMapGL>
    </div>
  );
};

export default Example;

export function getServerSideProps() {
  console.log('server side');
  return { props: { mapboxToken: process.env.MAPBOX_API_TOKEN || null } };
}
