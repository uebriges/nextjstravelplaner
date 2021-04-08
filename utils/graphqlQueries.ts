import { gql } from '@apollo/client';

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
      tripId
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

export const getUserTrips = gql`
  query($userId: Int) {
    getUserTrips(userId: $userId) {
      id
      title
      startDate
      endDate
    }
  }
`;

export const deleteSessionByToken = gql`
  mutation($token: String) {
    deleteSessionByToken(token: $token)
  }
`;

export const getSessionIdByToken = gql`
  query($token: String) {
    getSessionIdByToken(token: $token)
  }
`;

export const saveUserTrip = gql`
  mutation($userId: Int, $tripId: Int, $tripTitle: String) {
    saveUserTrip(userId: $userId, tripId: $tripId, tripTitle: $tripTitle)
  }
`;

export const startNewTrip = gql`
  mutation($token: String) {
    startNewTrip(token: $token)
  }
`;

export const switchToAnotherTrip = gql`
  mutation($currentSessionToken: String, $newTripId: String) {
    switchToAnotherTrip(
      currentSessionToken: $currentSessionToken
      newTripId: $newTripId
    )
  }
`;
