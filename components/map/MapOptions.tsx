/** @jsxImportSource @emotion/react */
import { useQuery } from '@apollo/client';
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

  return (
    <div css={mapOptionsStyle}>
      <Button onClick={handleSave} disabled={disabled}>
        Save
      </Button>
    </div>
  );
}
