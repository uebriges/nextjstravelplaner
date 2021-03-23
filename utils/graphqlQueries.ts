import { gql } from '@apollo/client';

export const userQuery = gql`
  query {
    user(userName: "asdf") {
      id
      userName
    }
  }
`;

export const getCurrentWaypoints = gql`
  query($token: String!) {
    waypoints(token: $token) {
      id
      longitude
      latitude
      waypointName
    }
  }
`;

export const setNewWaypoint = gql`
  mutation($token: String!, $longitude: String!, $latitude: String!) {
    setNewWaypoint(token: $token, longitude: $longitude, latitude: $latitude) {
      id
      longitude
      latitude
      waypointName
    }
  }
`;

module.exports = {
  userQuery,
  getCurrentWaypoints: getCurrentWaypoints,
  setNewWaypoint,
};
