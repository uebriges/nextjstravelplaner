/** @jsxImportSource @emotion/react */
import React from 'react';
import ReactMapGL from 'react-map-gl';
import { ViewportType } from '../pages/travelplaner';

type MapProps = {
  viewport: ViewportType;
  setViewport: (viewport: ViewportType) => void;
  mapboxToken: string;
  handleViewportChange: (newViewport: ViewportType) => void;
  mapRef: any;
};

export default function Map(props: React.PropsWithChildren<MapProps>) {
  const childrenWithProps = React.Children.map(props.children, (child) => {
    return React.cloneElement(child, {
      handleViewportChange: props.handleViewportChange,
      mapRef: props.mapRef,
      mapboxToken: props.mapboxToken,
    });
  });

  return (
    <ReactMapGL
      {...props.viewport}
      ref={props.mapRef}
      width="100%"
      height="100%"
      onViewportChange={props.handleViewportChange}
      mapboxApiAccessToken={props.mapboxToken}
    >
      {childrenWithProps}
    </ReactMapGL>
  );
}
