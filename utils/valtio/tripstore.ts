import { proxy } from 'valtio';

// IMPORTANT: Currently not used

type Waypoint = {
  id: number;
  longitude: number;
  latitude: number;
  locationName: string;
};

type TripStoreType = {
  waypoints: Waypoint[] | null;
  finalRoute: number[][] | null;
  addWaypoint: (long: number, lat: number, locationName: string) => void;
};

const tripStore: TripStoreType = proxy({
  waypoints: null,
  finalRoute: null,
  // addWaypoint: (long, lat, locationName) => {
  //   tripStore.push([]) = type;
  //   tripStore.activeSessionToken = token;
  // },
});

export default tripStore;
