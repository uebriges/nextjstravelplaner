import { useQuery } from '@apollo/client';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import MenuIcon from '@material-ui/icons/Menu';
import Alert from '@material-ui/lab/Alert';
import { useState } from 'react';
import { useSnapshot } from 'valtio';
import graphqlQueries from '../../utils/graphqlQueries';
import modalsStore, { MODALS } from '../../utils/valtio/modalsstore';
import sessionStore from '../../utils/valtio/sessionstore';

export type UserTripType = {
  id: number;
  title: string;
  start: string;
  end: string;
  notes: string;
  sessionId: number;
  userId;
};

export default function UserProfile() {
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const modalStoreSnapshot = useSnapshot(modalsStore);
  const sessionStateSnapshot = useSnapshot(sessionStore);

  // GraphQL Queries
  // Get current waypoints
  const waypoints = useQuery(graphqlQueries.getCurrentWaypoints, {
    variables: {
      token: sessionStateSnapshot.activeSessionToken,
    },
  });

  const userTrips = useQuery(graphqlQueries.getUserTrips, {
    variables: {
      userId: sessionStateSnapshot.userId,
    },
  });

  function handleCancel() {
    modalsStore.activateModal(MODALS.NONE);
  }

  return (
    <Dialog
      open={true}
      // onClose={handleClose}
      aria-labelledby="form dialog for registration"
      maxWidth="xl"
    >
      <DialogTitle id="profileDialogTitle">Profile</DialogTitle>
      <DialogContent>
        <List>
          {userTrips.data && userTrips.data.getUserTrips.length > 0
            ? userTrips.data.getUserTrips.map((currentTrip: UserTripType) => {
                return (
                  <ListItem key={currentTrip.id} button="true">
                    <ListItemIcon>
                      <MenuIcon />
                    </ListItemIcon>
                    <ListItemText>
                      <div key={currentTrip.id}>{currentTrip.id}</div>
                    </ListItemText>
                    <ListItemSecondaryAction>
                      <IconButton edge="end" aria-label="delete">
                        <CloseIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                );
              })
            : null}
        </List>

        {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}
        {successMessage ? (
          <Alert severity="success">{successMessage}</Alert>
        ) : null}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel} color="primary">
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}
