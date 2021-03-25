import { proxy } from 'valtio';

// IMPORTANT: Currently not used

type Waypoint = {
  id: number;
  long: string;
  lat: string;
  locationName: string;
  orderNumber: number;
};

type TripStoreType = {
  waypoints: Waypoint[] | null;
  finalRoute: number[][] | null;
  addWaypoint: (newWaypoint: Waypoint) => void;
};

const tripStore: TripStoreType = proxy({
  waypoints: null,
  finalRoute: null,
  // addWaypoint: (newWaypoint: Waypoint) => {
  //   tripStore.waypoints.push([]) = type;
  //   tripStore.activeSessionToken = token;
  // },
});

export default tripStore;
