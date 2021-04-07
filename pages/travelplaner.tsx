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
import CustomPopup from '../components/map/CustomPopup';
import MapOptions from '../components/map/MapOptions';
import Route from '../components/map/Route';
import WaypointMarkers from '../components/map/WaypointMarkers';
import WaypointsList from '../components/map/WaypointsList';
import { geocoderStyle, mapOptionsStyle, mapStyle } from '../styles/styles';
import graphqlQueries from '../utils/graphqlQueries';
import sessionStore, { SESSIONS } from '../utils/valtio/sessionstore';
import tripStore from '../utils/valtio/tripstore';
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
  orderNumber: number;
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
  csrfToken: string;
  isLoggedIn: boolean;
  currentTripId: number;
  currentUserId: number;
};

export type RouteStepType = {
  maneuver: {
    instruction: string;
  };
};

const TravelPlaner = (props: TravelPlanerPropsType) => {
  const sessionStateSnapshot = useSnapshot(sessionStore);
  const tripStateSnapshot = useSnapshot(tripStore);

  // set initial session state
  useEffect(() => {
    if (sessionStateSnapshot.activeSessionToken === '') {
      sessionStateSnapshot.setSession(SESSIONS.ANONYMOUS, props.sessionToken);
      sessionStateSnapshot.setCSRFToken(props.csrfToken);
    }
  }, [props.sessionToken, sessionStateSnapshot]);

  useEffect(() => {
    if (props.isLoggedIn) {
      sessionStateSnapshot.setSession(SESSIONS.LOGGEDIN, props.sessionToken);
      sessionStateSnapshot.setCSRFToken(props.csrfToken);
    }
  }, [props.isLoggedIn]);

  useEffect(() => {
    sessionStateSnapshot.setTripId(props.currentTripId);
  }, [props.currentTripId]);

  useEffect(() => {
    sessionStateSnapshot.setUserId(props.currentUserId);
  }, [props.currentUserId]);

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
  const waypoints = useQuery(graphqlQueries.getCurrentWaypoints, {
    variables: {
      token:
        sessionStateSnapshot.activeSessionToken !== ''
          ? sessionStateSnapshot.activeSessionToken
          : props.sessionToken,
    },
  });

  // Store new waypoint in DB
  const [setNewWaypoint] = useMutation(graphqlQueries.setNewWaypoint, {
    refetchQueries: [
      {
        query: graphqlQueries.getCurrentWaypoints,
        variables: { token: props.sessionToken },
      },
    ],
    awaitRefetchQueries: true,
  });

  // Refs
  const mapRef = useRef(null);
  const geoCoderContainerRef = useRef(null);

  const [currentRoute, setCurrentRoute] = useState<
    CoordinatesType[] | undefined
  >();
  // const [showPopup, togglePopup] = useState(false);
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
    return await waypoints.refetch();
  }

  useEffect(() => {
    generateTurnByTurnRoute();
  }, [waypoints.data, sessionStateSnapshot.tripId]);

  // Adds new coordinates to the DB
  async function addCoordinatesToRoute() {
    console.log('addCoordinatesToRoute');
    // Cookies variables
    let cookiesContent = [];
    let alreadyAvailableCoordinatesInCookies;
    let updatedWaypoints;

    // DB/Graphql variables
    let alreadyAvailableCoordinatesInDB;

    // Waypoint with exact same current logitude/latitude already part of the trip?
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

    // Waypoint not yet part of the trip
    if (!alreadyAvailableCoordinatesInDB) {
      console.log('coordinates not yet part of the trip ');
      const newWaypoint = await reversGeocodeWaypoint({
        id: 0, // could be any number, because waypoint id is defined by the DB
        longitude: currentLongitude,
        latitude: currentLatitude,
        waypointName: '',
      });
      console.log('newwaypoint revers: ', newWaypoint);
      let newWaypointData = await setNewWaypoint({
        variables: {
          token: sessionStateSnapshot.activeSessionToken,
          longitude: currentLongitude.toString(),
          latitude: currentLatitude.toString(),
          waypointName: newWaypoint.waypointName,
        },
      });

      console.log('new Waypoint data: ', newWaypointData);
      console.log(
        'setting tripId....',
        typeof newWaypointData.data.setNewWaypoint.tripId,
      );
      sessionStateSnapshot.setTripId(
        Number(newWaypointData.data.setNewWaypoint.tripId),
      );

      const newListOfWaypoints = await refetchWaypoints();
      console.log('new data: ', waypoints);

      // Update viewport to show all markers on the map (most of the time it will be zooming out)
      if (
        newListOfWaypoints.data.waypoints &&
        newListOfWaypoints.data.waypoints.length > 1
      ) {
        console.log('viewport adaptation waypoints.data: ', waypoints.data);
        const allLongitudes = newListOfWaypoints.data.waypoints.map(
          (waypoint: CoordinatesType) => waypoint.longitude,
        );
        const allLatitudes = newListOfWaypoints.data.waypoints.map(
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

    // Order waypoints and store in newWaypointsArray
    if (waypoints.data && waypoints.data.waypoints !== null) {
      newWaypointsArray = Array.from(waypoints.data.waypoints);
      // console.log('waypoints new generateTurnByTurn: ', newWaypointsArray);
      newWaypointsArray.sort((a, b) => {
        // console.log('a: ', a);
        // console.log('b: ', b);
        return a.orderNumber - b.orderNumber;
      });
    }

    // Generate the directions API call string
    let apiCallString = 'https://api.mapbox.com/directions/v5/mapbox/driving/';
    if (newWaypointsArray.length > 1) {
      newWaypointsArray.map(
        (waypoint: CoordinatesType, index: number, array: []) => {
          apiCallString += waypoint.longitude + '%2C' + waypoint.latitude;
          apiCallString +=
            index < array.length - 1
              ? '%3B'
              : `?alternatives=true&geometries=geojson&steps=true&banner_instructions=true&voice_instructions=true&access_token=${props.mapboxToken}`;
        },
      );

      // Call the API to retrieve the route information
      const routeJSON = await fetch(apiCallString);
      const response = await routeJSON.json();

      const legs = [];
      legs.push(...response.routes[0]?.legs);
      console.log('routes...: ', response.routes);
      const instructions = legs.map((leg) => {
        const legInstruction = leg.steps.map((step: RouteStepType) => {
          return step.maneuver.instruction;
        });
        return legInstruction;
      });
      console.log('Instructions: ', instructions);
      tripStateSnapshot.addDistance(response.routes[0]?.distance);
      tripStateSnapshot.addInstructions(instructions);
      setCurrentRoute(response.routes[0]?.geometry.coordinates);
    } else {
      // console.log('else waypoints: ', waypoints.data?.waypoints);
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
    waypoints.refetch();
    generateTurnByTurnRoute();
  }, []);

  return (
    <Layout>
      <Head>
        <title>Find your way</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div css={mapStyle} style={{ height: '100vh' }}>
        <div
          ref={geoCoderContainerRef}
          style={{ position: 'absolute', top: 20, left: 20, zIndex: 2 }}
        />
        <div css={mapOptionsStyle}>
          <MapOptions />
          <hr />
          <WaypointsList
            generateTurnByTurnRoute={generateTurnByTurnRoute}
            sessionToken={sessionStateSnapshot.activeSessionToken}
          />
        </div>
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
          <Route id="TravelplanerMapId" points={currentRoute} />
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
            css={geocoderStyle}
            mapRef={mapRef}
            onViewportChange={handleGeocoderViewportChange}
            mapboxApiAccessToken={props.mapboxToken}
            // position="top-left"
            // collapsed={true}
            marker={false}
            containerRef={geoCoderContainerRef}
            onResult={onSearchResult}
            //render -> Renders HTML into result -> use for add and mark as favorite
          />
        </Map>
      </div>
    </Layout>
  );
};

export default TravelPlaner;

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const {
    createSessionTwoHours,
    deleteAllExpiredSessions,
    isCurrentTokenLoggedIn,
    getCurrentTripIdByToken,
    getUserIdBytoken,
  } = await import('../utils/database');
  const { serializeSecureCookieServerSide } = await import('../utils/cookies');
  const { createCsrfToken } = await import('../utils/auth');

  await deleteAllExpiredSessions();

  let token;

  // if new session needed = 2 hours token
  console.log('Getserversideprops travelplaner -> ', ctx.req.cookies);
  console.log(
    'Getserversideprops travelplaner -> ',
    Object.keys(ctx.req.cookies).length,
  );
  console.log(
    'Getserversideprops travelplaner -> ',
    ctx.req.cookies.constructor === Object,
  );
  if (
    ctx.req.cookies.session === 'undefined' ||
    !ctx.req.cookies.session ||
    (Object.keys(ctx.req.cookies).length === 0 &&
      ctx.req.cookies.constructor === Object)
  ) {
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

  const csrfToken = createCsrfToken(token);

  // Is user already logged in?
  const loggedIn = await isCurrentTokenLoggedIn(token);

  // Is there currently a trip the user is working on
  const currentTripId = await getCurrentTripIdByToken(token);

  // Which user is logged in?
  const currentUserId = await getUserIdBytoken(token);

  return {
    props: {
      mapboxToken: process.env.MAPBOXAPITOKEN || null,
      routeInCookies: ctx.req.cookies.route || null,
      sessionToken: token || null,
      csrfToken: csrfToken || null,
      isLoggedIn: loggedIn || null,
      currentTripId: currentTripId || null,
      currentUserId: currentUserId || null,
    },
  };
}
