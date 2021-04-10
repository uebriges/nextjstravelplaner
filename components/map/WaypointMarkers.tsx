/** @jsxImportSource @emotion/react */
import { useMutation } from '@apollo/client';
import { useEffect, useState } from 'react';
import { Marker } from 'react-map-gl';
import { CallbackEvent } from 'react-map-gl/src/components/draggable-control';
import { useSnapshot } from 'valtio';
import { CoordinatesType } from '../../pages/travelplaner';
import {
  getCurrentWaypoints,
  updateWaypoints,
} from '../../utils/graphqlQueries';
import sessionStore from '../../utils/valtio/sessionstore';
import MarkerIcon from './MarkerIcon';

type WaypointMarkerPropsType = {
  waypoints: CoordinatesType[] | undefined;
  reversGeocodeWaypoint: (
    waypoint: CoordinatesType,
  ) => Promise<CoordinatesType>;
  generateTurnByTurnRoute: () => void;
};

// type DrawMarkerPropsType = {
//   ctx: CanvasRenderingContext2D;
//   width: number;
//   height: number;
//   project: (lnglat: number[]) => [];
//   unproject: (lnglat: number[]) => [];
// };

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
  const [updateWaypointsFunction] = useMutation(updateWaypoints, {
    refetchQueries: [
      {
        query: getCurrentWaypoints,
        variables: { token: sessionStateSnapshot.activeSessionToken },
      },
    ],
    awaitRefetchQueries: true,
  });

  // Event handler: End of dragging
  const handleOnDragEnd = async (
    event: CallbackEvent,
    id: number | undefined,
  ) => {
    if (!currentWayPoints) {
      return;
    }
    const movedWayPoint = {
      ...currentWayPoints.find((waypoint) => waypoint.id === id),
    };

    movedWayPoint.longitude = event.lngLat[0];
    movedWayPoint.latitude = event.lngLat[1];

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

    // setCurrentWayPoints(updatedWayPoints);
    // Cookies.set('waypoints', JSON.stringify(currentWayPoints));
    await updateWaypointsFunction({
      variables: {
        waypoints: updatedWayPoints,
      },
    });
    props.generateTurnByTurnRoute();
    setCurrentWayPoints(updatedWayPoints);
  };

  return (
    <div>
      {currentWayPoints
        ? currentWayPoints.map((waypoint) => {
            return (
              <Marker
                key={waypoint.id} // waypoint.longitude + waypoint.latitude
                latitude={Number(waypoint.latitude)}
                longitude={Number(waypoint.longitude)}
                offsetLeft={-20}
                offsetTop={-10}
                draggable
                onDragEnd={(event) => {
                  handleOnDragEnd(event, waypoint.id);
                }}
              >
                <MarkerIcon />
              </Marker>
            );
          })
        : null}
    </div>
  );
}
