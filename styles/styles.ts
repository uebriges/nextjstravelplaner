/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

export const routeListStyle = css`
  z-index: 1;
  background: white;
`;

export const customPopupStyle = css`
  z-index: 30;
`;

export const footerStlye = css`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 50;
`;

export const mapOptionsStyle = css`
  width: 400px;
  position: absolute;
  left: 20px;
  z-index: 1;
  top: 100px;
  background: white;
`;

export const geocoderStyle = css`
  .mapboxgl-ctrl-geocoder {
    z-index: 40;
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
