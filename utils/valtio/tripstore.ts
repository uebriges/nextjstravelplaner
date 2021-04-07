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
  distance: number;
  instructions: string[][];
  addDistance: (distance: number) => void;
  addInstructions: (instructions: string[]) => void;
};

const tripStore: TripStoreType = proxy({
  waypoints: null,
  finalRoute: null,
  distance: 0,
  instructions: [],
  addDistance: (distance) => {
    tripStore.distance = distance;
  },
  addInstructions: (instructions) => {
    tripStore.instructions = instructions;
  },
});

export default tripStore;
