/** @jsxImportSource @emotion/react */
import Cookies from 'js-cookie';
import { useCallback, useEffect, useState } from 'react';
import { Marker } from 'react-map-gl';
import { CoordinatesType } from '../pages/travelplaner';
import MarkerIcon from './MarkerIcon';

type WaypointMarkerPropsType = {
  waypoints: CoordinatesType[] | undefined;
  reversGeocodeWaypoint: (waypoint: CoordinatesType) => CoordinatesType;
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

  // Set waypoint marker at first render
  useEffect(() => {
    setCurrentWayPoints(props.waypoints);
  }, []);

  console.log('props.waypoints: ', props.waypoints);
  const waypoints = props.waypoints;
  console.log('currentWayPoints: ', currentWayPoints);

  // Event handler: End of dragging
  const handleOnDragEnd = async (event, id) => {
    console.log('handleOnDragEnd');
    if (!currentWayPoints) {
      return;
    }
    const movedWayPoint = {
      ...currentWayPoints.find((waypoint) => waypoint.id === id),
    };
    // if (!movedWayPoint.id) return;
    const newLocationName = await props.reversGeocodeWaypoint(movedWayPoint);

    movedWayPoint.locationName = newLocationName.locationName;
    movedWayPoint.longitude = event.lngLat[0];
    movedWayPoint.latitude = event.lngLat[1];

    const updatedWayPoints: CoordinatesType[] = currentWayPoints.map(
      (waypoint) => {
        if (waypoint.id === id) {
          return movedWayPoint;
        }
        return waypoint;
      },
    );

    setCurrentWayPoints(updatedWayPoints);
    Cookies.set('waypoints', JSON.stringify(updatedWayPoints));
  };

  const handleOnDrag = useCallback((event) => {
    console.log('handleOnDrag');
    console.log('event.lngLat: ', event.lngLat);
    console.log('dragging...');
  }, []);

  return (
    <div>
      {currentWayPoints
        ? currentWayPoints.map((waypoint, id) => {
            return (
              <Marker
                key={id} // waypoint.longitude + waypoint.latitude
                latitude={waypoint.latitude}
                longitude={waypoint.longitude}
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
