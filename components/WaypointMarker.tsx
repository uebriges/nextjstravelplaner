/** @jsxImportSource @emotion/react */
import Image from 'next/image';
import { Marker } from 'react-map-gl';
import { CoordinatesType } from '../pages/travelplaner';

type WaypointMarkerPropsType = {
  waypoints: CoordinatesType[] | undefined;
};

export default function WaypointMarker(props: WaypointMarkerPropsType) {
  const waypoints = props.waypoints;

  function handleOnDragEnd(event: PointerEvent) {
    console.log('event: ', event);
  }
  return (
    <div>
      {waypoints.map((waypoint) => {
        return (
          <Marker
            key={waypoint.longitude + waypoint.latitude}
            latitude={waypoint.latitude}
            longitude={waypoint.longitude}
            offsetLeft={-20}
            offsetTop={-10}
          >
            <Image
              src="/locationIcon.svg"
              alt="marker"
              width={30}
              height={30}
              key={waypoint.longitude + waypoint.latitude}
            />
          </Marker>
        );
      })}
    </div>
  );
}
