/** @jsxImportSource @emotion/react */
import Image from 'next/image';
import React, { useState } from 'react';
import ReactMapGL, { Marker } from 'react-map-gl';
import { ViewportType } from '../pages/travelplaner';

type MapProps = {
  viewport: ViewportType;
  setViewport: (viewport: ViewportType) => void;
  mapboxToken: string;
  handleViewportChange: (newViewport: ViewportType) => void;
  mapRef: any;
};

export default function Map(props: React.PropsWithChildren<MapProps>) {
  const [currentMarkerPosition, setCurrentMarkerPosition] = useState([
    props.viewport.longitude,
    props.viewport.latitude,
  ]);
  const [markerSetByClick, setMarkerSetByClick] = useState(false);

  const childrenWithProps = React.Children.map(props.children, (child) => {
    return React.cloneElement(child, {
      handleViewportChange: props.handleViewportChange,
      mapRef: props.mapRef,
      mapboxToken: props.mapboxToken,
    });
  });

  function handleOnclick(event) {
    console.log('pointer event: ', event);
    console.log('pointer event point: ', event.point);
    console.log('pointer event lnglat: ', event.lngLat);
    console.log('clicked');
    console.log('props.viewport: ', props.viewport);
    setCurrentMarkerPosition(event.lngLat);
    setMarkerSetByClick(true);
  }

  return (
    <ReactMapGL
      {...props.viewport}
      ref={props.mapRef}
      width="100%"
      height="100%"
      onViewportChange={props.handleViewportChange}
      mapboxApiAccessToken={props.mapboxToken}
      onClick={handleOnclick}
    >
      {markerSetByClick ? (
        <Marker
          key="currentMarker"
          latitude={currentMarkerPosition[1]}
          longitude={currentMarkerPosition[0]}
          offsetLeft={-20}
          offsetTop={-10}
        >
          <Image
            src="/locationIcon.svg"
            alt="marker"
            width={30}
            height={30}
            key="currentMarkerImageKey"
          />
        </Marker>
      ) : null}

      {childrenWithProps}
    </ReactMapGL>
  );
}
