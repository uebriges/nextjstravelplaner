import { proxy } from 'valtio';
import { ViewportType } from '../../pages/travelplaner';

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
  viewport: ViewportType | null;
  addDistance: (distance: number) => void;
  addInstructions: (instructions: string[][]) => void;
  setViewport: (viewport: ViewportType) => void;
};

const tripStore: TripStoreType = proxy({
  waypoints: null,
  finalRoute: null,
  distance: 0,
  instructions: [],
  viewport: null,
  addDistance: (distance) => {
    tripStore.distance = distance;
  },
  addInstructions: (instructions) => {
    tripStore.instructions = instructions;
  },
  setViewport: (viewport) => {
    tripStore.viewport = viewport;
  },
});

export default tripStore;
