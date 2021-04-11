/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

export const globalStyles = css`
  html,
  body {
    padding: 0;
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen,
      Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  * {
    box-sizing: border-box;
  }

  .MuiSvgIcon-root,
  .MuiButton-label {
    color: #f3f2f2;
  }

  // Lift the mapbox copyright images/links into the map instead
  // of having them in the bottom menu
  .mapboxgl-ctrl-bottom-left,
  .mapboxgl-ctrl-bottom-right {
    bottom: 56px;
  }

  // Make all modal button labels this color
  .modal-button-label .MuiButton-label {
    color: rgb(61 120 162);
  }
`;

export const customPopupStyle = css`
  z-index: 1;
`;

export const footerStyle = css`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1;
`;

export const mapOptionsStyle = css`
  width: 300px;
  position: absolute;
  left: 20px;
  z-index: 10;
  top: 100px;
  background: white;
`;

export const mapStyle = css`
  div.overlays {
    z-index: 1;
  }

  .mapboxgl-popup-content {
    z-index: 1;
  }
`;

export const geocoderStyle = css`
  .mapboxgl-ctrl-geocoder {
    z-index: 1;
    background-color: rgb(61 120 162);
    color: #f3f2f2;
  }

  .suggestions-wrapper,
  .mapboxgl-ctrl-geocoder--input,
  .mapboxgl-ctrl-geocoder--suggestion,
  .suggestions,
  .active,
  .mapboxgl-ctrl-geocoder--suggestion-title,
  .mapboxgl-ctrl-geocoder--suggestion-address,
  .mapboxgl-ctrl {
    background-color: rgb(61 120 162);
    color: #f3f2f2;
  }
`;

export const mapOptionButtonsStyles = css`
  display: flex;
  justify-content: space-around;
`;

export const mapOptionsSpansStyles = css`
  display: flex;
  justify-content: space-around;

  span {
    padding: 6px 8px;
  }
`;

export const sideBarButton = css`
  z-index: 3;
  left: 0;
  position: absolute;
  width: 20px;
  height: 100px;
  background-color: rgb(61 120 162);
  top: 40%;
  border-top-right-radius: 7px;
  border-bottom-right-radius: 7px;
  border: none;
  outline: none;
  color: #f3f2f2;
`;

export const sideBarButtonInside = css`
  z-index: 8000;
  right: -20px;
  position: absolute;
  width: 20px;
  height: 100px;
  background-color: white;
  top: 40%;
  border-top-right-radius: 7px;
  border-bottom-right-radius: 7px;
  border: none;
  outline: none;
`;

export const UIDrawerStyle = css`
  .MuiDrawer-paperAnchorLeft {
    width: 300px;
    color: #f3f2f2;
    overflow: visible;
    background-color: rgb(61 120 162);

    hr {
      width: 280px;
    }
  }
  .MuiList-padding {
    background-color: rgb(61 120 162);
  }
`;

// export const WaypointListIconsStyle = css`
//   color: #f3f2f2;
// `;
