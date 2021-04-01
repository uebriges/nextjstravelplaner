/** @jsxImportSource @emotion/react */
import { useMutation, useQuery } from '@apollo/client';
import { Button } from '@material-ui/core';
import { useEffect, useState } from 'react';
import { useSnapshot } from 'valtio';
import { mapOptionsStyle } from '../../styles/styles';
import graphqlQueries from '../../utils/graphqlQueries';
import modalsStore, {
  INITIALACTION,
  MODALS,
} from '../../utils/valtio/modalsstore';
import sessionStore, { SESSIONS } from '../../utils/valtio/sessionstore';

export default function MapOptions() {
  const [disabled, setDisabled] = useState(true);
  const sessionStateSnapshot = useSnapshot(sessionStore);
  const modalStateSnapshot = useSnapshot(modalsStore);

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
    <div css={mapOptionsStyle}>
      <Button onClick={handleSave} disabled={disabled}>
        Save
      </Button>
      <Button onClick={handleStartNewTrip}>Start new trip</Button>
    </div>
  );
}
