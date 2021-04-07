/** @jsxImportSource @emotion/react */
import { useMutation } from '@apollo/client';
import { useCallback, useEffect, useState } from 'react';
import { Marker } from 'react-map-gl';
import { useSnapshot } from 'valtio';
import { CoordinatesType } from '../../pages/travelplaner';
import graphqlQueries from '../../utils/graphqlQueries';
import sessionStore from '../../utils/valtio/sessionstore';
import MarkerIcon from './MarkerIcon';

type WaypointMarkerPropsType = {
  waypoints: CoordinatesType[] | undefined;
  reversGeocodeWaypoint: (waypoint: CoordinatesType) => CoordinatesType;
  generateTurnByTurnRoute: () => void;
};

type DrawMarkerPropsType = {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  project: (lnglat: number[]) => [];
  unproject: (lnglat: number[]) => [];
};

export default function WaypointMarkers(props: WaypointMarkerPropsType) {
  const [currentWayPoints, setCurrentWayPoints] = useState<
    CoordinatesType[] | undefined
  >();

  // Set waypoint marker as soon as props.waypoints changes
  useEffect(() => {
    setCurrentWayPoints(props.waypoints);
  }, [props.waypoints]);

  // Retrieves current token
  const sessionStateSnapshot = useSnapshot(sessionStore);

  // Update waypoints in DB
  const [updateWaypoints] = useMutation(graphqlQueries.updateWaypoints, {
    refetchQueries: [
      {
        query: graphqlQueries.getCurrentWaypoints,
        variables: { token: sessionStateSnapshot.activeSessionToken },
      },
    ],
    awaitRefetchQueries: true,
  });

  const waypoints = props.waypoints;

  // Event handler: End of dragging
  const handleOnDragEnd = async (event, id) => {
    console.log('handleOnDragEnd');
    console.log('current waypoints: ', [...currentWayPoints]);
    if (!currentWayPoints) {
      return;
    }
    const movedWayPoint = {
      ...currentWayPoints.find((waypoint) => waypoint.id === id),
    };

    console.log('moved waypoint: ', movedWayPoint);

    movedWayPoint.longitude = event.lngLat[0].toString();
    movedWayPoint.latitude = event.lngLat[1].toString();

    console.log('movedWayPoint afterwards: ', movedWayPoint);
    if (!movedWayPoint.id) return;
    const updatedMovedWaypoint = await props.reversGeocodeWaypoint(
      movedWayPoint,
    );

    movedWayPoint.waypointName = updatedMovedWaypoint.waypointName;

    const updatedWayPoints: CoordinatesType[] = currentWayPoints.map(
      (waypoint) => {
        if (waypoint.id === id) {
          return movedWayPoint;
        }
        return waypoint;
      },
    );

    console.log('before updating waypoints: ', updatedWayPoints);

    // setCurrentWayPoints(updatedWayPoints);
    // Cookies.set('waypoints', JSON.stringify(currentWayPoints));
    await updateWaypoints({
      variables: {
        waypoints: updatedWayPoints,
      },
    });
    console.log('waypoints updated');
    props.generateTurnByTurnRoute();
    console.log('generated turn by turn');
    setCurrentWayPoints(updatedWayPoints);
    console.log('state waypoints updated');
  };

  const handleOnDrag = useCallback((event) => {
    // console.log('handleOnDrag');
    // console.log('event.lngLat: ', event.lngLat);
    // console.log('dragging...');
  }, []);

  return (
    <div>
      {currentWayPoints
        ? currentWayPoints.map((waypoint, id) => {
            return (
              <Marker
                key={id} // waypoint.longitude + waypoint.latitude
                latitude={Number(waypoint.latitude)}
                longitude={Number(waypoint.longitude)}
                offsetLeft={-20}
                offsetTop={-10}
                draggable
                onDragEnd={(event) => {
                  handleOnDragEnd(event, waypoint.id);
                }}
                onDrag={handleOnDrag}
              >
                <MarkerIcon />
              </Marker>
            );
          })
        : null}
    </div>
  );
}
