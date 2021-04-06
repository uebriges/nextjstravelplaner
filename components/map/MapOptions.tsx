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
import graphqlQueries from '../../utils/graphqlQueries';
import modalsStore, {
  INITIALACTION,
  MODALS,
} from '../../utils/valtio/modalsstore';
import sessionStore, { SESSIONS } from '../../utils/valtio/sessionstore';
import tripStore from '../../utils/valtio/tripstore';

export default function MapOptions() {
  const [disabled, setDisabled] = useState(true);
  const sessionStateSnapshot = useSnapshot(sessionStore);
  const modalStateSnapshot = useSnapshot(modalsStore);
  const tripStateSnapshot = useSnapshot(tripStore);

  const waypoints = useQuery(graphqlQueries.getCurrentWaypoints, {
    variables: {
      token: sessionStateSnapshot.activeSessionToken,
    },
  });

  const [startNewTrip] = useMutation(graphqlQueries.startNewTrip, {
    refetchQueries: [
      {
        query: graphqlQueries.getCurrentWaypoints,
        variables: { token: sessionStateSnapshot.activeSessionToken },
      },
    ],
    awaitRefetchQueries: true,
  });

  // Save button is active if at least one waypoint is selected
  useEffect(() => {
    waypoints.data && waypoints.data.waypoints.length > 0
      ? setDisabled(false)
      : setDisabled(true);
  }, [waypoints]);

  // Save trip
  function handleSave() {
    console.log(
      'handle save sessionStateSnapshot.activeSessionType',
      sessionStateSnapshot.activeSessionType,
    );
    if (sessionStateSnapshot.activeSessionType !== SESSIONS.LOGGEDIN) {
      modalStateSnapshot.setInitialAction(INITIALACTION.SAVETRIP);
      modalStateSnapshot.activateModal(MODALS.LOGIN);
    } else {
      console.log('handle save if logged in');
      modalStateSnapshot.activateModal(MODALS.SAVETRIP);
    }
  }

  async function handleStartNewTrip() {
    console.log(
      'handleStartNewTrip -> sessionToken: ',
      sessionStateSnapshot.activeSessionToken,
    );
    const newTripId = await startNewTrip({
      variables: {
        token: sessionStateSnapshot.activeSessionToken,
      },
    });

    sessionStateSnapshot.setTripId(newTripId.data.startNewTrip);
    console.log('handleStartNewTrip -> newTrip: ', newTripId.data.startNewTrip);
  }

  return (
    <div>
      <div css={mapOptionButtonsStyles}>
        <Button
          onClick={handleSave}
          disabled={disabled}
          startIcon={<SaveIcon />}
        >
          Save
        </Button>
        <Button onClick={handleStartNewTrip} startIcon={<AutorenewIcon />}>
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
