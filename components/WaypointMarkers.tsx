/** @jsxImportSource @emotion/react */
import Cookies from 'js-cookie';
import Image from 'next/image';
import { useCallback, useState } from 'react';
import { Marker } from 'react-map-gl';
import { CoordinatesType } from '../pages/travelplaner';

type WaypointMarkerPropsType = {
  waypoints: CoordinatesType[] | undefined;
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
  >(props.waypoints);
  console.log('props.waypoints: ', props.waypoints);
  const waypoints = props.waypoints;
  console.log('currentWayPoints: ', currentWayPoints);

  const handleOnDragEnd = useCallback((event) => {
    console.log('handleOnDragEnd');
    setCurrentWayPoints(
      currentWayPoints?.map((waypoint) => {
        console.log('waypoint: ', waypoint);
        if (
          waypoint.longitude === Number(event.target.id.split('+')[0]) &&
          waypoint.latitude === Number(event.target.id.split('+')[1])
        ) {
          waypoint.longitude = event.lngLat[0];
          waypoint.latitude = event.lngLat[1];
          console.log('waypoint new: ', waypoint);
          return waypoint;
        }
        console.log('waypoint new: ', waypoint);
        return waypoint;
      }),
    );
    Cookies.set('waypoint', JSON.stringify(currentWayPoints));
  }, []);

  const handleOnDrag = useCallback((event) => {
    console.log('event.lngLat: ', event.lngLat);
    console.log('dragging...');
  }, []);

  return (
    <div>
      {currentWayPoints
        ? currentWayPoints.map((waypoint) => {
            return (
              <Marker
                key={waypoint.longitude + waypoint.latitude}
                latitude={waypoint.latitude}
                longitude={waypoint.longitude}
                offsetLeft={-20}
                offsetTop={-10}
                draggable={true}
                onDragEnd={handleOnDragEnd}
                onDrag={handleOnDrag}
              >
                <Image
                  id={`${waypoint.longitude}+${waypoint.latitude}`}
                  src="/locationIcon.svg"
                  alt="marker"
                  width={30}
                  height={30}
                  key={waypoint.longitude + waypoint.latitude}
                />
              </Marker>
            );
          })
        : null}
    </div>
  );
}
