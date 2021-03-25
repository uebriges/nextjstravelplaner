/** @jsxImportSource @emotion/react */
import { useMutation, useQuery } from '@apollo/client';
import 'mapbox-gl/dist/mapbox-gl.css';
import { GetServerSidePropsContext } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Marker, WebMercatorViewport } from 'react-map-gl';
import Geocoder from 'react-map-gl-geocoder';
import 'react-map-gl-geocoder/dist/mapbox-gl-geocoder.css';
import { useSnapshot } from 'valtio';
import Layout from '../components/Layout';
import Map from '../components/Map';
import CustomPopup from '../components/maputils/CustomPopup';
import Route from '../components/maputils/Route';
import WaypointMarkers from '../components/maputils/WaypointMarkers';
import WaypointsList from '../components/maputils/WaypointsList';
import graphqlQueries from '../utils/graphqlQueries';
import sessionStore, { SESSIONS } from '../utils/valtio/sessionstore';

// Ways to set Mapbox token: https://uber.github.io/react-map-gl/#/Documentation/getting-started/about-mapbox-tokens

type LocationInDBType = {
  id: string;
  longitude: string;
  latitude: string;
};

export type CoordinatesType = {
  id: number;
  longitude: number;
  latitude: number;
  waypointName: string;
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
  sessionToken: string;
};

const TravelPlaner = (props: TravelPlanerPropsType) => {
  const sessionStateSnapshot = useSnapshot(sessionStore);

  // set initial session state
  useEffect(() => {
    if (sessionStateSnapshot.activeSessionToken === '') {
      sessionStateSnapshot.setSession(SESSIONS.ANONYMOUS, props.sessionToken);
    }
  }, [props.sessionToken, sessionStateSnapshot]);

  const [viewport, setViewport] = useState({
    width: '100vw',
    height: '100vh',
    latitude: 48.204845,
    longitude: 16.368368,
    zoom: 12,
    transitionDuration: 1000,
  });
  const [currentLatitude, setCurrentLatitude] = useState(38.899826);
  const [currentLongitude, setCurrentLongitude] = useState(-77.023041);
  const handleViewportChange = useCallback(
    (newViewport) => setViewport(newViewport),
    [],
  );

  // GraphQL queries
  // Get current waypoints
  // console.log('props.sessionToken: ', props.sessionToken);
  const waypoints = useQuery(graphqlQueries.getCurrentWaypoints, {
    variables: { token: props.sessionToken },
  });

  // Store new waypoint in DB
  const [setNewWaypoint, { dataNewWaypoint }] = useMutation(
    graphqlQueries.setNewWaypoint,
    {
      refetchQueries: [
        {
          query: graphqlQueries.getCurrentWaypoints,
          variables: { token: props.sessionToken },
        },
      ],
      awaitRefetchQueries: true,
    },
  );

  // Refs
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

  async function refetchWaypoints() {
    console.log('refetching.....');
    waypoints.refetch();
  }

  useEffect(() => {
    console.log('useEffect generate turn by turn');
    generateTurnByTurnRoute();
  }, [waypoints.data]);

  // Adds new coordinates to the cookies
  async function addCoordinatesToRoute() {
    console.log('addCoordinatesToRoute');
    // Cookies variables
    let cookiesContent = [];
    let alreadyAvailableCoordinatesInCookies;
    let updatedWaypoints;

    // DB/Graphql variables
    let alreadyAvailableCoordinatesInDB;

    // Loggedin or not?
    // if not -> trip already available? -> trip with session_id available?
    // if logged in -> trip already available? -> trip with session_id
    // if logged in + trip available -> change token of trip with tripId

    if (sessionStateSnapshot.activeSessionType === SESSIONS.LOGGEDIN) {
      // Insert new waypoint into DB
    } else if (sessionStateSnapshot.activeSessionType === SESSIONS.ANONYMOUS) {
      console.log('data in addcoord: ', waypoints.data);
      if (waypoints.data && waypoints.data.waypoints.length > 0) {
        alreadyAvailableCoordinatesInDB = waypoints.data.waypoints.find(
          (waypoint: LocationInDBType) => {
            return (
              waypoint.longitude === currentLongitude.toString() &&
              waypoint.latitude === currentLatitude.toString()
            );
          },
        );
      }

      if (!alreadyAvailableCoordinatesInDB) {
        console.log('not yet int here');
        const newWaypoint = await reversGeocodeWaypoint({
          id: 0, // could be any number, because waypoint id is defined by the DB
          longitude: currentLongitude,
          latitude: currentLatitude,
          waypointName: '',
        });
        console.log('newwaypoint revers: ', newWaypoint);
        await setNewWaypoint({
          variables: {
            token: props.sessionToken,
            longitude: currentLongitude.toString(),
            latitude: currentLatitude.toString(),
            waypointName: newWaypoint.waypointName,
          },
        });

        console.log('new waypoint created');

        refetchWaypoints();
        console.log('new data: ', waypoints);
        // waypoints.refetch();
      } else if (
        sessionStateSnapshot.activeSessionType ===
        SESSIONS.DURINGLOGINORREGISTER
      ) {
        console.log(
          'sessionStateSnapshot.activeSessionType: ',
          sessionStateSnapshot.activeSessionType,
        );
      }

      // generateTurnByTurnRoute();

      // Update viewport to show all markers on the map (most of the time it will be zooming out)
      if (waypoints.data?.waypoints && waypoints.data?.waypoints.length > 1) {
        const allLongitudes = waypoints.data.waypoints.map(
          (waypoint: CoordinatesType) => waypoint.longitude,
        );
        const allLatitudes = waypoints.data.waypoints.map(
          (waypoint: CoordinatesType) => waypoint.latitude,
        );
        console.log('allLat: ', allLatitudes);

        const maxLong = Math.max(...allLongitudes);
        const maxLat = Math.max(...allLatitudes);
        const minLong = Math.min(...allLongitudes);
        const minLat = Math.min(...allLatitudes);

        const { longitude, latitude, zoom } = new WebMercatorViewport(
          viewport,
        ).fitBounds(
          [
            [minLong, minLat],
            [maxLong, maxLat],
          ],
          {
            padding: 30,
            offset: [0, -100],
          },
        );
        setViewport({
          ...viewport,
          longitude,
          latitude,
          zoom,
          transitionDuration: 1000,
          // transitionInterpolator: new FlyToInterpolator(),
          // transitionEasing: d3.easeCubic,
        });
      }
    }
  }

  // Generate turn by turn route
  async function generateTurnByTurnRoute() {
    // console.log('data in generateTurnByTurnRoute: ', waypoints.data);
    let newWaypointsArray = [];
    if (waypoints.data) {
      newWaypointsArray = Array.from(waypoints.data.waypoints);
      // console.log('waypoints new generateTurnByTurn: ', newWaypointsArray);
      newWaypointsArray.sort((a, b) => {
        // console.log('a: ', a);
        // console.log('b: ', b);
        return a.orderNumber - b.orderNumber;
      });
    }

    console.log('waypoints new in order: ', newWaypointsArray);

    let apiCallString = 'https://api.mapbox.com/directions/v5/mapbox/driving/';
    if (newWaypointsArray.length > 1) {
      newWaypointsArray.map(
        (waypoint: CoordinatesType, index: number, array: []) => {
          apiCallString += waypoint.longitude + '%2C' + waypoint.latitude;
          apiCallString +=
            index < array.length - 1
              ? '%3B'
              : `?alternatives=true&geometries=geojson&steps=true&access_token=${props.mapboxToken}`;
        },
      );
      console.log('apiCallString: ', apiCallString);
      const routeJSON = await fetch(apiCallString);
      const response = await routeJSON.json();
      // Cookies.set('finalRoute', response.routes[0]?.geometry.coordinates);
      setCurrentRoute(response.routes[0]?.geometry.coordinates);
    } else {
      console.log('else waypoints: ', waypoints.data?.waypoints);
      setCurrentRoute(waypoints.data?.waypoints);
      // Cookies.set('finalRoute', waypoints.data?.waypoints);
    }
  }

  // Translates coordinates into location names
  async function reversGeocodeWaypoint(waypoint: CoordinatesType) {
    // if (waypoint) {
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
    waypoint.waypointName = geoCodeJSON.features[0].place_name;
    // }
    console.log('waypoint:', waypoint);

    return waypoint;
  }

  function onSearchResult() {
    setMarkerSetBySearchResult(true);
  }

  useEffect(() => {
    generateTurnByTurnRoute();
  }, []);

  return (
    <Layout>
      <Head>
        <title>Find your way</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div style={{ height: '100vh' }}>
        <div
          ref={geoCoderContainerRef}
          style={{ position: 'absolute', top: 20, left: 20, zIndex: 1 }}
        />

        <WaypointsList
          generateTurnByTurnRoute={generateTurnByTurnRoute}
          sessionToken={props.sessionToken}
        />
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
          <WaypointMarkers
            waypoints={waypoints.data?.waypoints}
            reversGeocodeWaypoint={reversGeocodeWaypoint}
            generateTurnByTurnRoute={generateTurnByTurnRoute}
          />
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
            // collapsed={true}
            marker={false}
            containerRef={geoCoderContainerRef}
            onResult={onSearchResult}
            //render -> Renders HTML into result -> use for add and mark as favorite
          />
        </Map>
        <button onClick={() => waypoints.refetch()}>refetch</button>
      </div>
    </Layout>
  );
};

export default TravelPlaner;

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const { createSessionTwoHours, deleteAllExpiredSessions } = await import(
    '../utils/database'
  );
  const { serializeSecureCookieServerSide } = await import('../utils/cookies');

  await deleteAllExpiredSessions();

  let token;

  // if new session needed = 2 hours token
  if (ctx.req.cookies.session === 'undefined' || !ctx.req.cookies.session) {
    console.log('no session available yet');
    // Set 2 hours token -> Anonymous
    token = (await createSessionTwoHours()).token;

    const sessionCookie = serializeSecureCookieServerSide(
      'session',
      token,
      60 * 120,
    );

    ctx.res.setHeader('Set-Cookie', sessionCookie);
  } else {
    token = ctx.req.cookies.session;
    console.log(' session available ');
  }

  return {
    props: {
      mapboxToken: process.env.MAPBOX_API_TOKEN || null,
      routeInCookies: ctx.req.cookies.route || null,
      sessionToken: token || null,
    },
  };
}
