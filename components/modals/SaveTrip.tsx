import { useMutation, useQuery } from '@apollo/client';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import { useEffect, useState } from 'react';
import { useSnapshot } from 'valtio';
import graphqlQueries from '../../utils/graphqlQueries';
import modalsStore, { MODALS } from '../../utils/valtio/modalsstore';
import sessionStore from '../../utils/valtio/sessionstore';

export default function SaveTrip() {
  const [tripTitle, setTripTitle] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const modalStoreSnapshot = useSnapshot(modalsStore);
  const sessionStoreSnapshot = useSnapshot(sessionStore);

  console.log(
    '--> Save trip active session token: ',
    sessionStoreSnapshot.activeSessionToken,
  );

  // Get current session id
  const sessionId = useQuery(graphqlQueries.getSessionIdByToken, {
    variables: {
      token: sessionStoreSnapshot.activeSessionToken,
    },
  });

  console.log('--> Save trip active session Id: ', sessionId);

  // Refetch of getUserTrips is needed to deactivate the save button immediately
  const [saveUserTrip] = useMutation(graphqlQueries.saveUserTrip, {
    refetchQueries: [
      {
        query: graphqlQueries.getUserTrips,
        variables: {
          userId: sessionStoreSnapshot.userId,
        },
      },
    ],
    awaitRefetchQueries: true,
  });

  console.log('--> Save trip saveUserTrip function: ', saveUserTrip);

  useEffect(() => {
    console.log('session Id use effect: ', sessionId);
  }, [sessionId.data]);

  function handleCancel() {
    modalStoreSnapshot.activateModal(MODALS.NONE);
  }

  function handleSave() {
    console.log('Session id current: ', sessionId.data.getSessionIdByToken);
    console.log('trip title: ', tripTitle);
    console.log('trip id: ', sessionStoreSnapshot.tripId);
    if (sessionId.data.getSessionIdByToken) {
      console.log('in if');
      saveUserTrip({
        variables: {
          userId: sessionStoreSnapshot.userId,
          tripId: sessionStoreSnapshot.tripId,
          tripTitle: tripTitle,
        },
      });
    }
    modalStoreSnapshot.activateModal(MODALS.NONE);
  }

  return (
    <Dialog
      open={true}
      // onClose={handleClose}
      aria-labelledby="form dialog for saving a trip"
    >
      <DialogTitle id="form dialog title for saving a trip">
        Save your trip...
      </DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          id="tripName"
          label="Trip title"
          type="text"
          fullWidth
          onChange={(e) => setTripTitle(e.target.value)}
        />
        {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel} color="primary">
          Cancel
        </Button>
        <Button data-cy="SaveTripToDBBtn" onClick={handleSave} color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
