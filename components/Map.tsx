/** @jsxImportSource @emotion/react */
import Image from 'next/image';
import React, { useState } from 'react';
import ReactMapGL, { MapEvent, Marker } from 'react-map-gl';
import { ViewportType } from '../pages/travelplaner';
import CustomPopup from './map/CustomPopup';

type MapProps = {
  setMarkerSetByClick: (value: boolean) => void;
  setMarkerSetBySearchResult: (value: boolean) => void;
  setViewport: (viewport: ViewportType) => void;
  handleViewportChange: (newViewport: ViewportType) => void;
  addCoordinatesToRoute: () => void;
  setCurrentLatitude: (latitude: number) => void;
  setCurrentLongitude: (longitude: number) => void;
  viewport: ViewportType;
  mapboxToken: string;
  mapRef: any;
  markerSetByClick: boolean;
  markerSetBySearchResult: boolean;
  children: React.ReactElement[];
};

export default function Map(props: MapProps) {
  const [currentMarkerPosition, setCurrentMarkerPosition] = useState([
    props.viewport.longitude,
    props.viewport.latitude,
  ]);
  const [marker, setMarker] = useState(false);

  const childrenWithProps = React.Children.map(props.children, (child) => {
    return React.cloneElement(child, {
      handleViewportChange: props.handleViewportChange,
      mapRef: props.mapRef,
      mapboxToken: props.mapboxToken,
    });
  });

  function handleOnclick(event: MapEvent) {
    // Needed to position the marker + popup after clicking on the map
    setCurrentMarkerPosition(event.lngLat);

    // Needed to position the view of the map to the position clicked on the map
    props.setCurrentLongitude(event.lngLat[0]);
    props.setCurrentLatitude(event.lngLat[1]);

    // Needed to distinguish between marker+popup
    // - After search in Geolocator search field
    // - After clicking on the map
    props.setMarkerSetBySearchResult(false);
    props.setMarkerSetByClick(true);

    // Needed to toggle marker on and off after clicking on the map
    setMarker(marker ? false : true);
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
      mapStyle="mapbox://styles/mapbox/outdoors-v11"
    >
      {props.markerSetByClick && !props.markerSetBySearchResult && marker ? (
        <>
          <Marker
            // key="currentMarker"
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
              // key="currentMarkerImageKey"
            />
          </Marker>
          <CustomPopup
            // key="currentWaypointPopup"
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
