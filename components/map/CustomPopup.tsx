/** @jsxImportSource @emotion/react */
import { Button } from '@mui/material';
import { Popup } from 'react-map-gl';
import { customPopupStyle } from '../../styles/styles';

type CustomPopupPropsType = {
  longitude: number;
  latitude: number;
  addCoordinatesToRoute: () => void;
};

export default function CustomPopup(props: CustomPopupPropsType) {
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
      >
        <div>
          <Button
            data-cy="AddWaypointBtn"
            variant="contained"
            onClick={props.addCoordinatesToRoute}
          >
            Add to trip
          </Button>
        </div>
      </Popup>
    </div>
  );
}
