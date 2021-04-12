import { useMutation, useQuery } from '@apollo/client';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Table,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import { useState } from 'react';
import { useSnapshot } from 'valtio';
import { updateViewPort, ViewportType } from '../../pages/travelplaner';
import {
  deleteSessionByToken,
  getCurrentWaypoints,
  getUserTrips,
  switchToAnotherTrip,
  updateSessionOfCorrespondingTrip,
} from '../../utils/graphqlQueries';
import modalsStore, { MODALS } from '../../utils/valtio/modalsstore';
import sessionStore, { SESSIONS } from '../../utils/valtio/sessionstore';
import tripStore from '../../utils/valtio/tripstore';

export type UserTripType = {
  id: number;
  title: string;
  startDate: string;
  endDate: string;
  notes: string;
  sessionId: number;
  userId: number;
};

interface ColumnType {
  id: string;
  label: string;
  minWidth?: number;
  align?: 'right' | 'center';
}

const columnHeaders: ColumnType[] = [
  { id: 'id', label: 'Id', minWidth: 100 },
  { id: 'title', label: 'Title', minWidth: 300 },
  {
    id: 'start',
    label: 'Start',
    minWidth: 170,
    align: 'center',
  },
  {
    id: 'end',
    label: 'End',
    minWidth: 170,
    align: 'center',
  },
];

export default function UserProfile() {
  const [errorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const sessionStateSnapshot = useSnapshot(sessionStore);
  const tripStateSnapshot = useSnapshot(tripStore);

  // GraphQL Queries
  // Get waypoints of specific trip
  const [switchToAnotherTripFunction] = useMutation(switchToAnotherTrip, {
    refetchQueries: [
      {
        query: getCurrentWaypoints,
        variables: { token: sessionStateSnapshot.activeSessionToken },
      },
    ],
    awaitRefetchQueries: true,
  });

  // Get the list of trips of a user
  const userTrips = useQuery(getUserTrips, {
    variables: {
      userId: sessionStateSnapshot.userId,
    },
  });

  // Get current waypoints
  const waypoints = useQuery(getCurrentWaypoints, {
    variables: {
      token: sessionStateSnapshot.activeSessionToken,
    },
  });

  // Delete session by token
  const [deleteSessionByTokenFunction] = useMutation(deleteSessionByToken);

  // Update session of current trip to new session token
  const [updateSessionOfCorrespondingTripFunction] = useMutation(
    updateSessionOfCorrespondingTrip,
  );

  // Cancel closes the modal
  function handleCancel() {
    modalsStore.activateModal(MODALS.NONE);
  }

  // Chose a saved trip to display it on the map
  function handleTableRowClick(
    event: React.MouseEvent<HTMLTableDataCellElement> &
      React.MouseEvent<HTMLTableHeaderCellElement>,
  ) {
    sessionStateSnapshot.setTripId(
      Number((event.target as HTMLTableDataCellElement).id),
    );
    switchToAnotherTripFunction({
      variables: {
        currentSessionToken: sessionStateSnapshot.activeSessionToken,
        newTripId: (event.target as HTMLTableDataCellElement).id,
      },
    });
    console.log('waypoints before calling updateViewPort: ', waypoints);
    const newViewPort = updateViewPort(waypoints.data.waypoints, {
      width: 100,
      height: 100,
      latitude: 48.204845,
      longitude: 16.368368,
      zoom: 12,
      transitionDuration: 1000,
    });
    tripStateSnapshot.setViewport(newViewPort as ViewportType);
    setSuccessMessage('Switched to another trip');
    modalsStore.activateModal(MODALS.NONE);
  }

  async function handleLogout() {
    modalsStore.activateModal(MODALS.NONE);

    // Update session token for trip -> new session token
    const newToken = await updateSessionOfCorrespondingTripFunction({
      variables: {
        sessions: {
          currentToken: sessionStore.activeSessionToken,
          action: 'logout',
        },
      },
    });

    // Delete former session -> db
    await deleteSessionByTokenFunction({
      variables: {
        token: sessionStateSnapshot.activeSessionToken,
      },
    });

    // Set new session in session state
    sessionStateSnapshot.setSession(
      SESSIONS.ANONYMOUS,
      newToken.data.updateSessionOfCorrespondingTrip[0],
    );
    sessionStateSnapshot.setUserId(0);
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
        <Paper>
          <TableContainer>
            <Table stickyHeader aria-label="sticky table">
              <TableHead>
                <TableRow>
                  {columnHeaders.map((column) => (
                    <TableCell
                      id={column.id.toString()}
                      key={column.id}
                      align={column.align}
                      style={{ minWidth: column.minWidth }}
                    >
                      {column.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              {userTrips.data && userTrips.data.getUserTrips.length > 0
                ? userTrips.data.getUserTrips.map(
                    (currentTrip: UserTripType) => {
                      return (
                        <TableRow
                          data-cy={'trip' + currentTrip.id.toString()}
                          hover
                          role="checkbox"
                          tabIndex={-1}
                          key={currentTrip.id.toString()}
                        >
                          <TableCell
                            align="center"
                            onClick={handleTableRowClick}
                            id={currentTrip.id.toString()}
                          >
                            {currentTrip.id}
                          </TableCell>
                          <TableCell
                            align="left"
                            onClick={handleTableRowClick}
                            id={currentTrip.id.toString()}
                          >
                            {currentTrip.title}
                          </TableCell>
                          <TableCell
                            align="center"
                            onClick={handleTableRowClick}
                            id={currentTrip.id.toString()}
                          >
                            {currentTrip.startDate
                              ? new Date(
                                  Number(currentTrip.startDate),
                                ).toLocaleDateString()
                              : null}
                          </TableCell>
                          <TableCell
                            align="center"
                            onClick={handleTableRowClick}
                            id={currentTrip.id.toString()}
                          >
                            {currentTrip.endDate
                              ? new Date(
                                  Number(currentTrip.endDate),
                                ).toLocaleDateString()
                              : null}
                          </TableCell>
                        </TableRow>
                      );
                    },
                  )
                : null}
              {errorMessage ? (
                <Alert severity="error">{errorMessage}</Alert>
              ) : null}
              {successMessage ? (
                <Alert severity="success">{successMessage}</Alert>
              ) : null}
            </Table>
          </TableContainer>
        </Paper>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleLogout} className="modal-button-label">
          Logout
        </Button>
        <Button onClick={handleCancel} className="modal-button-label">
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}
