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
  mutation(
    $token: String!
    $longitude: String!
    $latitude: String!
    $waypointName: String!
  ) {
    setNewWaypoint(
      token: $token
      longitude: $longitude
      latitude: $latitude
      waypointName: $waypointName
    ) {
      id
      longitude
      latitude
      waypointName
    }
  }
`;

export const updateWaypoints = gql`
  mutation($waypoints: [Waypoint]) {
    updateWaypoints(waypoints: $waypoints) {
      id
      longitude
      latitude
      waypointName
      orderNumber
    }
  }
`;

export const deleteWaypoint = gql`
  mutation($waypointId: Int!) {
    deleteWaypoint(waypointId: $waypointId) {
      id
      waypointName
    }
  }
`;

module.exports = {
  userQuery,
  getCurrentWaypoints: getCurrentWaypoints,
  setNewWaypoint,
  updateWaypoints,
  deleteWaypoint,
};
