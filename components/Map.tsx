/** @jsxImportSource @emotion/react */
import Image from 'next/image';
import React, { useState } from 'react';
import ReactMapGL, { Marker } from 'react-map-gl';
import { ViewportType } from '../pages/travelplaner';
import CustomPopup from './CustomPopup';

type MapProps = {
  viewport: ViewportType;
  setViewport: (viewport: ViewportType) => void;
  mapboxToken: string;
  handleViewportChange: (newViewport: ViewportType) => void;
  mapRef: any;
  addCoordinatesToRoute: () => void;
  setCurrentLatitude: (latitude: Number) => void;
  setCurrentLongitude: (longitude: Number) => void;
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
    // console.log('pointer event: ', event);
    // console.log('pointer event point: ', event.point);
    console.log('pointer event lnglat: ', event.lngLat);
    // console.log('clicked');
    // console.log('props.viewport: ', props.viewport);

    setCurrentMarkerPosition(event.lngLat);
    props.setCurrentLongitude(event.lngLat[0]);
    props.setCurrentLatitude(event.lngLat[1]);
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
        <>
          <Marker
            key="currentMarker"
            latitude={currentMarkerPosition[1]}
            longitude={currentMarkerPosition[0]}
            offsetLeft={-15}
            offsetTop={-30}
          >
            <Image
              src="/locationIcon.svg"
              alt="marker"
              width={30}
              height={30}
              key="currentMarkerImageKey"
            />
          </Marker>
          <CustomPopup
            key="currentWaypointPopup"
            longitude={currentMarkerPosition[0]}
            latitude={currentMarkerPosition[1]}
            addCoordinatesToRoute={props.addCoordinatesToRoute} // doesn't know anything about the current long lat of the popup
          />
        </>
      ) : null}

      {childrenWithProps}
    </ReactMapGL>
  );
}
