/** @jsxImportSource @emotion/react */
import Cookies from 'js-cookie';
import { useCallback, useEffect, useState } from 'react';
import { Marker } from 'react-map-gl';
import { CoordinatesType } from '../../pages/travelplaner';
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

  const waypoints = props.waypoints;

  // Event handler: End of dragging
  const handleOnDragEnd = async (event, id) => {
    console.log('handleOnDragEnd');
    if (!currentWayPoints) {
      return;
    }
    const movedWayPoint = {
      ...currentWayPoints.find((waypoint) => waypoint.id === id),
    };

    movedWayPoint.longitude = event.lngLat[0];
    movedWayPoint.latitude = event.lngLat[1];

    console.log('movedWayPoint: ', movedWayPoint);
    if (!movedWayPoint.id) return;
    const updatedMovedWaypoint = await props.reversGeocodeWaypoint(
      movedWayPoint,
    );

    // console.log(
    //   'updatedMovedWaypoint.locationName: ',
    //   updatedMovedWaypoint.waypointName,
    // );

    movedWayPoint.waypointName = updatedMovedWaypoint.waypointName;

    // const updatedWayPoints: CoordinatesType[] = currentWayPoints.map(
    //   (waypoint) => {
    //     if (waypoint.id === id) {
    //       return movedWayPoint;
    //     }
    //     return waypoint;
    //   },
    // );

    // setCurrentWayPoints(updatedWayPoints);
    Cookies.set('waypoints', JSON.stringify(currentWayPoints));
    props.generateTurnByTurnRoute();
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
                onDragEnd={(event) => handleOnDragEnd(event, waypoint.id)}
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
