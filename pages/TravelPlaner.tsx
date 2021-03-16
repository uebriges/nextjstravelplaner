/** @jsxImportSource @emotion/react */
import { Button } from '@material-ui/core';
import Cookies from 'js-cookie';
import 'mapbox-gl/dist/mapbox-gl.css';
import { GetServerSidePropsContext } from 'next';
import Head from 'next/head';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Popup } from 'react-map-gl';
import Geocoder from 'react-map-gl-geocoder';
import 'react-map-gl-geocoder/dist/mapbox-gl-geocoder.css';
import Map from '../components/Map';
import Route from '../components/Route';
import WaypointsList from '../components/WaypointsList';

// Ways to set Mapbox token: https://uber.github.io/react-map-gl/#/Documentation/getting-started/about-mapbox-tokens

export type CoordinatesType = {
  longitude: number;
  latitude: number;
  locationName: string;
};

export type ViewportType = {
  width: string;
  height: string;
  latitude: number;
  longitude: number;
  zoom: number;
};

export type TravelPlanerPropsType = {
  routeInCookies: CoordinatesType[];
  mapboxToken: string;
};

const TravelPlaner = (props: TravelPlanerPropsType) => {
  const [viewport, setViewport] = useState({
    width: '100vw',
    height: '100vh',
    latitude: 38.899826,
    longitude: -77.023041,
    zoom: 13,
  });
  const [currentLatitude, setCurrentLatitude] = useState(38.899826);
  const [currentLongitude, setCurrentLongitude] = useState(-77.023041);
  const handleViewportChange = useCallback(
    (newViewport) => setViewport(newViewport),
    [],
  );
  const mapRef = useRef(null);
  const geoCoderContainerRef = useRef(null);
  const [currentRoute, setCurrentRoute] = useState<
    CoordinatesType[] | undefined
  >();
  const [showPopup, togglePopup] = useState(false);

  // Handle Geocorder viewport change
  const handleGeocoderViewportChange = useCallback(
    (newViewport) => {
      setCurrentLatitude(Number(newViewport.latitude));
      setCurrentLongitude(Number(newViewport.longitude));

      const geocoderDefaultOverrides = { transitionDuration: 1000 };

      return handleViewportChange({
        ...newViewport,
        ...geocoderDefaultOverrides,
      });
    },
    [handleViewportChange],
  );

  // Adds new coordinates to the cookies
  async function addCoordinatesToRoute() {
    let cookiesContent = [];
    let alreadyAvailableCoordinatesInCookies;

    // Search for coordinates in cookies
    if (Cookies.get('waypoint')) {
      // console.log('route exists');

      cookiesContent = Cookies.getJSON('waypoint');
      alreadyAvailableCoordinatesInCookies = cookiesContent.find(
        (coordinates: CoordinatesType) =>
          coordinates.longitude === currentLongitude &&
          coordinates.latitude === currentLatitude,
      );
    }

    // If not in cookies yet, add the new coordinates
    if (!alreadyAvailableCoordinatesInCookies) {
      // console.log('already available');
      console.log(
        'new entry: ',
        await reversGeocodeWaypoint({
          longitude: currentLongitude,
          latitude: currentLatitude,
          locationName: '',
        }),
      );
      Cookies.set('waypoint', [
        ...cookiesContent,
        await reversGeocodeWaypoint({
          longitude: currentLongitude,
          latitude: currentLatitude,
          locationName: '',
        }),
      ]);
    }
    generateTurnByTurnRoute();
  }

  // Generate turn by turn route
  async function generateTurnByTurnRoute() {
    let apiCallString = 'https://api.mapbox.com/directions/v5/mapbox/driving/';
    const route = Cookies.getJSON('waypoint');
    if (route && route.length > 1) {
      route.map((coordinates: CoordinatesType, index: number, array: []) => {
        apiCallString += coordinates.longitude + '%2C' + coordinates.latitude;
        apiCallString +=
          index < array.length - 1
            ? '%3B'
            : `?alternatives=true&geometries=geojson&steps=true&access_token=${props.mapboxToken}`;
      });
      const routeJSON = await fetch(apiCallString);
      const response = await routeJSON.json();
      Cookies.set('finalRoute', response.routes[0]?.geometry.coordinates);
      setCurrentRoute(response.routes[0]?.geometry.coordinates);
    } else {
      setCurrentRoute(route);
      Cookies.set('finalRoute', route);
    }
  }

  async function reversGeocodeWaypoint(waypoint: CoordinatesType) {
    if (waypoint) {
      let apiCallString;
      apiCallString = 'https://api.mapbox.com/geocoding/v5/mapbox.places/';
      apiCallString +=
        waypoint.longitude +
        ',' +
        waypoint.latitude +
        '.json?access_token=' +
        props.mapboxToken;
      const response = await fetch(apiCallString);
      const geoCodeJSON = await response.json();
      console.log('place_name: ', geoCodeJSON.features[0].place_name);
      waypoint.locationName = geoCodeJSON.features[0].place_name;
    }

    return waypoint;
  }

  useEffect(() => {
    generateTurnByTurnRoute();
  }, []);

  return (
    <>
      <Head>
        <title>Find your way</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div style={{ height: '100vh' }}>
        <div
          ref={geoCoderContainerRef}
          style={{ position: 'absolute', top: 20, left: 20, zIndex: 1 }}
        />
        <WaypointsList generateTurnByTurnRoute={generateTurnByTurnRoute} />
        <Map
          mapboxToken={props.mapboxToken}
          viewport={viewport}
          setViewport={setViewport}
          handleViewportChange={handleViewportChange}
          mapRef={mapRef}
        >
          <Route points={currentRoute} />
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
        </Map>
      </div>
    </>
  );
};

export default TravelPlaner;

export function getServerSideProps(ctx: GetServerSidePropsContext) {
  return {
    props: {
      mapboxToken: process.env.MAPBOX_API_TOKEN || null,
      routeInCookies: ctx.req.cookies.route || null,
    },
  };
}
