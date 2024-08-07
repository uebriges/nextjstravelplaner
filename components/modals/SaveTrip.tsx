import { useMutation, useQuery } from '@apollo/client';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';
import { useState } from 'react';
import { useSnapshot } from 'valtio';
import {
  getSessionIdByToken,
  getUserTrips,
  saveUserTrip,
} from '../../utils/graphqlQueries';
import modalsStore, { MODALS } from '../../utils/valtio/modalsstore';
import sessionStore from '../../utils/valtio/sessionstore';

export default function SaveTrip() {
  const [tripTitle, setTripTitle] = useState('');
  const modalStoreSnapshot = useSnapshot(modalsStore);
  const sessionStoreSnapshot = useSnapshot(sessionStore);

  // Get current session id
  const sessionId = useQuery(getSessionIdByToken, {
    variables: {
      token: sessionStoreSnapshot.activeSessionToken,
    },
  });

  // Refetch of getUserTrips is needed to deactivate the save button immediately
  const [saveUserTripFunction] = useMutation(saveUserTrip, {
    refetchQueries: [
      {
        query: getUserTrips,
        variables: {
          userId: sessionStoreSnapshot.userId,
        },
      },
    ],
    awaitRefetchQueries: true,
  });

  function handleCancel() {
    modalStoreSnapshot.activateModal(MODALS.NONE);
  }

  function handleSave() {
    if (sessionId.data.getSessionIdByToken) {
      saveUserTripFunction({
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
          variant="standard"
          margin="dense"
          id="tripName"
          label="Trip title"
          type="text"
          fullWidth
          onChange={(e) => setTripTitle(e.target.value)} />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel} className="modal-button-label">
          Cancel
        </Button>
        <Button
          data-cy="SaveTripToDBBtn"
          onClick={handleSave}
          className="modal-button-label"
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
