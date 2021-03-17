/** @jsxImportSource @emotion/react */
import Image from 'next/image';
import { CanvasOverlay, Marker } from 'react-map-gl';
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

export default function WaypointMarker(props: WaypointMarkerPropsType) {
  const waypoints = props.waypoints;

  function drawMarker({
    ctx,
    width,
    height,
    project,
    unproject,
  }: DrawMarkerPropsType) {
    // console.log('ctx: ', ctx);
    // console.log('width: ', width);
    // console.log('height: ', height);
    // console.log('project: ', project);
    // console.log('unproject: ', unproject([width, height]));
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
      <CanvasOverlay redraw={drawMarker} />
    </div>
  );
}
