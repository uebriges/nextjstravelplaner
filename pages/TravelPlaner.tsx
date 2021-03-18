/** @jsxImportSource @emotion/react */
import Cookies from 'js-cookie';
import 'mapbox-gl/dist/mapbox-gl.css';
import { GetServerSidePropsContext } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Marker } from 'react-map-gl';
import Geocoder from 'react-map-gl-geocoder';
import 'react-map-gl-geocoder/dist/mapbox-gl-geocoder.css';
import CustomPopup from '../components/CustomPopup';
import Map from '../components/Map';
import Route from '../components/Route';
import WaypointMarker from '../components/WaypointMarkers';
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
    latitude: 48.204845,
    longitude: 16.368368,
    zoom: 12,
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
  const [markerSetByClick, setMarkerSetByClick] = useState(false);
  const [markerSetBySearchResult, setMarkerSetBySearchResult] = useState(false);

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
    console.log('addCoordinatesToRoute');
    let cookiesContent = [];
    let alreadyAvailableCoordinatesInCookies;

    // Search for coordinates in cookies
    if (Cookies.get('waypoint')) {
      console.log('route exists');

      cookiesContent = Cookies.getJSON('waypoint');
      alreadyAvailableCoordinatesInCookies = cookiesContent.find(
        (coordinates: CoordinatesType) =>
          coordinates.longitude === currentLongitude &&
          coordinates.latitude === currentLatitude,
      );
    }

    // If not in cookies yet, add the new coordinates
    if (!alreadyAvailableCoordinatesInCookies) {
      console.log('current Long: ', currentLongitude);
      console.log('current Lat: ', currentLatitude);

      console.log('not yet  available');
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
      console.log('response: ', response);
      Cookies.set('finalRoute', response.routes[0]?.geometry.coordinates);
      setCurrentRoute(response.routes[0]?.geometry.coordinates);
    } else {
      setCurrentRoute(route);
      Cookies.set('finalRoute', route);
    }
  }

  // Translates coordinates into location names
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
      waypoint.locationName = geoCodeJSON.features[0].place_name;
    }

    return waypoint;
  }

  function onSearchResult() {
    setMarkerSetBySearchResult(true);
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
          addCoordinatesToRoute={addCoordinatesToRoute}
          setCurrentLatitude={setCurrentLatitude}
          setCurrentLongitude={setCurrentLongitude}
          markerSetByClick={markerSetByClick}
          setMarkerSetByClick={setMarkerSetByClick}
          markerSetBySearchResult={markerSetBySearchResult}
          setMarkerSetBySearchResult={setMarkerSetBySearchResult}
        >
          <Route points={currentRoute} />
          <WaypointMarker waypoints={Cookies.getJSON('waypoint')} />
          {currentLatitude && currentLongitude && markerSetBySearchResult ? (
            <>
              <Marker
                key="asdflkj"
                latitude={currentLatitude}
                longitude={currentLongitude}
                offsetLeft={-20}
                offsetTop={-10}
              >
                <Image
                  src="/locationIcon.svg"
                  alt="marker"
                  width={30}
                  height={30}
                />
              </Marker>
              <CustomPopup
                key="currentWaypointPopup"
                longitude={Number(currentLongitude)}
                latitude={Number(currentLatitude)}
                addCoordinatesToRoute={addCoordinatesToRoute}
              />
            </>
          ) : null}
          <Geocoder
            mapRef={mapRef}
            onViewportChange={handleGeocoderViewportChange}
            mapboxApiAccessToken={props.mapboxToken}
            position="top-left"
            collapsed={true}
            marker={false}
            containerRef={geoCoderContainerRef}
            onResult={onSearchResult}
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
