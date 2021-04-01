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
  // ---------------------- construction area ------------------
  //  getSessionIdByToken still loads and therefore ???
  //
  const sessionId = useQuery(graphqlQueries.getSessionIdByToken, {
    variables: {
      token: sessionStoreSnapshot.activeSessionToken,
    },
  });

  console.log('--> Save trip active session Id: ', sessionId);
  const [saveUserTrip] = useMutation(graphqlQueries.saveUserTrip);

  console.log('--> Save trip saveUserTrip function: ', saveUserTrip);

  useEffect(() => {
    console.log('session Id use effect: ', sessionId);
  }, [sessionId.data]);

  function handleCancel() {
    modalStoreSnapshot.activateModal(MODALS.NONE);
  }

  function handleSave() {
    console.log('Session id current: ', sessionId.data.getSessionIdByToken);
    if (sessionId.data.getSessionIdByToken) {
      console.log('in if');
      saveUserTrip({
        variables: {
          userId: sessionStoreSnapshot.userId,
          sessionId: sessionId.data.getSessionIdByToken,
        },
      });
    }

    console.log('waypoints: ', typeof sessionId);
    console.log('session token: ', typeof sessionId.data.getSessionIdByToken);
    console.log('user_id: ', typeof sessionStoreSnapshot.userId);
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
        <Button onClick={handleSave} color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
