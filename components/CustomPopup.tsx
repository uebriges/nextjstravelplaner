/** @jsxImportSource @emotion/react */
import { Button } from '@material-ui/core';
import { useState } from 'react';
import { Popup } from 'react-map-gl';
import { customPopupStyle } from '../styles/styles';

type CustomPopupPropsType = {
  longitude: number;
  latitude: number;
  addCoordinatesToRoute: () => void;
};

export default function CustomPopup(props: CustomPopupPropsType) {
  const [showPopup, togglePopup] = useState(true); // -> has to be lifted and set to true every time a click on the map happens.

  return (
    <div>
      <Popup
        key="currentWaypointPopup"
        latitude={props.latitude}
        longitude={props.longitude}
        closeButton={false}
        closeOnClick={true}
        anchor="top"
        css={customPopupStyle}
        onClose={() => {
          togglePopup(false);
        }}
      >
        <div>
          <Button
            variant="contained"
            color="primary"
            onClick={props.addCoordinatesToRoute}
          >
            Add to route
          </Button>
        </div>
      </Popup>
    </div>
  );
}
