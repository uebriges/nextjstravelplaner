/** @jsxImportSource @emotion/react */
import { useMutation, useQuery } from '@apollo/client';
import { Button } from '@material-ui/core';
import AutorenewIcon from '@material-ui/icons/Autorenew';
import SaveIcon from '@material-ui/icons/Save';
import { useEffect, useState } from 'react';
import { useSnapshot } from 'valtio';
import {
  mapOptionButtonsStyles,
  mapOptionsSpansStyles,
} from '../../styles/styles';
import {
  getCurrentWaypoints,
  getUserTrips,
  startNewTrip,
  updateSessionOfCorrespondingTrip,
} from '../../utils/graphqlQueries';
import modalsStore, {
  INITIALACTION,
  MODALS,
} from '../../utils/valtio/modalsstore';
import sessionStore, { SESSIONS } from '../../utils/valtio/sessionstore';
import tripStore from '../../utils/valtio/tripstore';

type CurrentTripType = {
  id: number;
  title: string;
  startDate: string;
  endDate: string;
};

export default function MapOptions() {
  const [disabled, setDisabled] = useState(true);
  const sessionStateSnapshot = useSnapshot(sessionStore);
  const modalStateSnapshot = useSnapshot(modalsStore);
  const tripStateSnapshot = useSnapshot(tripStore);

  // GraphQL
  const waypoints = useQuery(getCurrentWaypoints, {
    variables: {
      token: sessionStateSnapshot.activeSessionToken,
    },
  });

  const [startNewTripFunction] = useMutation(startNewTrip, {
    refetchQueries: [
      {
        query: getCurrentWaypoints,
        variables: { token: sessionStateSnapshot.activeSessionToken },
      },
    ],
    awaitRefetchQueries: true,
  });

  const userTrips = useQuery(getUserTrips, {
    variables: {
      userId: sessionStateSnapshot.userId,
    },
  });

  const [updateSessionOfCorrespondingTripFunction] = useMutation(
    updateSessionOfCorrespondingTrip,
  );

  // Save button is active if at least one waypoint is selected
  useEffect(() => {
    const indexOfTrip = userTrips.data?.getUserTrips?.findIndex(
      (currentTrip: CurrentTripType) => {
        return currentTrip.id === sessionStateSnapshot.tripId;
      },
    );

    waypoints.data &&
    waypoints.data.waypoints.length > 0 &&
    (indexOfTrip < 0 || typeof indexOfTrip === 'undefined')
      ? setDisabled(false)
      : setDisabled(true);
  }, [waypoints, userTrips]);

  // Save trip
  async function handleSave() {
    if (sessionStateSnapshot.activeSessionType !== SESSIONS.LOGGEDIN) {
      modalStateSnapshot.setInitialAction(INITIALACTION.SAVETRIP);
      modalStateSnapshot.activateModal(MODALS.LOGIN);

      // Change session id of trip to 5 mins session token
      const newTokenAndCSRF = await updateSessionOfCorrespondingTripFunction({
        variables: {
          sessions: { currentToken: sessionStateSnapshot.activeSessionToken },
        },
      });

      // Store fallback + update session token in sessionStore + update csrf
      sessionStateSnapshot.setFallbackSession();
      sessionStateSnapshot.setSession(
        SESSIONS.DURINGLOGINORREGISTER,
        newTokenAndCSRF.data.updateSessionOfCorrespondingTrip[0],
      );
      sessionStateSnapshot.setCSRFToken(
        newTokenAndCSRF.data.updateSessionOfCorrespondingTrip[1],
      );
    } else {
      modalStateSnapshot.activateModal(MODALS.SAVETRIP);
    }
  }

  async function handleStartNewTrip() {
    const newTripId = await startNewTripFunction({
      variables: {
        token: sessionStateSnapshot.activeSessionToken,
      },
    });

    sessionStateSnapshot.setTripId(newTripId.data.startNewTrip);
  }

  return (
    <div>
      <div css={mapOptionButtonsStyles}>
        <Button
          className="save-trip-button"
          data-cy="SaveTripBtn"
          onClick={handleSave}
          disabled={disabled}
          startIcon={<SaveIcon />}
        >
          Save
        </Button>
        <Button
          data-cy="StartNewTripBtn"
          onClick={handleStartNewTrip}
          startIcon={<AutorenewIcon />}
        >
          Start new trip
        </Button>
      </div>
      <div css={mapOptionsSpansStyles}>
        <span>Current Trip: {sessionStateSnapshot.tripId}</span>
        <span>
          Distance: {(tripStateSnapshot.distance / 1000).toFixed(2)} km
        </span>
      </div>
    </div>
  );
}
