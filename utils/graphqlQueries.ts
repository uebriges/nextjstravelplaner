import { gql } from '@apollo/client';

export const userQuery = gql`
  query {
    user(userName: "asdf") {
      id
      userName
    }
  }
`;

export const registerUser = gql`
  mutation($user: UserRegisterInput) {
    registerUser(user: $user) {
      id
      userName
    }
  }
`;

export const loginUser = gql`
  mutation($user: UserLoginInput) {
    loginUser(user: $user) {
      user {
        id
        userName
      }
      tokens {
        token
        csrf
      }
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
      orderNumber
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
  mutation($waypoints: [WaypointInput]!) {
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

export const updateSessionOfCorrespondingTrip = gql`
  mutation($sessions: UpdateSessionInput) {
    updateSessionOfCorrespondingTrip(sessions: $sessions)
  }
`;

module.exports = {
  userQuery,
  getCurrentWaypoints: getCurrentWaypoints,
  setNewWaypoint,
  updateWaypoints,
  deleteWaypoint,
  registerUser,
  loginUser,
  updateSessionOfCorrespondingTrip,
};
