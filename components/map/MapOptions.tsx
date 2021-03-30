/** @jsxImportSource @emotion/react */
import { useQuery } from '@apollo/client';
import { Button } from '@material-ui/core';
import { useEffect, useState } from 'react';
import { useSnapshot } from 'valtio';
import { mapOptionsStyle } from '../../styles/styles';
import graphqlQueries from '../../utils/graphqlQueries';
import sessionStore from '../../utils/valtio/sessionstore';

export default function MapOptions() {
  const [disabled, setDisabled] = useState(true);
  const sessionStateSnapshot = useSnapshot(sessionStore);

  const waypoints = useQuery(graphqlQueries.getCurrentWaypoints, {
    variables: {
      token: sessionStateSnapshot.activeSessionToken,
    },
  });

  // Save button is active if at least one waypoint is selected
  useEffect(() => {
    waypoints.data && waypoints.data.length > 0
      ? setDisabled(false)
      : setDisabled(true);
    console.log('map options changed', disabled);
  }, [waypoints]);

  // Save trip
  function handleSave() {}

  return (
    <div css={mapOptionsStyle}>
      <Button onClick={handleSave} disabled={disabled}>
        Save
      </Button>
    </div>
  );
}
