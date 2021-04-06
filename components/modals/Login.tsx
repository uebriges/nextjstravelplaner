import { useMutation } from '@apollo/client';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import { useState } from 'react';
import { useSnapshot } from 'valtio';
import graphqlQueries from '../../utils/graphqlQueries';
import modalsStore, {
  INITIALACTION,
  MODALS,
} from '../../utils/valtio/modalsstore';
import sessionStore, { SESSIONS } from '../../utils/valtio/sessionstore';

export default function Login(props) {
  const [userName, setUserName] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const sessionStateSnapshot = useSnapshot(sessionStore);
  const modalStateSnapshot = useSnapshot(modalsStore);

  const [
    loginUserDB,
    { error: loginError, loading: loginLoading },
  ] = useMutation(graphqlQueries.loginUser, {
    onCompleted({ loggedIn }) {
      return loggedIn;
    },
  });

  // if (loading) return 'Loading …';
  // if (error) return 'Something went wrong!';

  function handleCancel() {
    modalsStore.activateModal(MODALS.NONE);
  }

  async function handleLogin(event) {
    event.preventDefault();
    if (userName === '' || userPassword === '') {
      setError('User name or password missing.');
      return;
    }
    console.log('csrf before login: ', sessionStateSnapshot.csrfToken);
    console.log(
      'session token before login: ',
      sessionStateSnapshot.activeSessionToken,
    );
    const loggedIn = await loginUserDB({
      variables: {
        user: {
          username: userName,
          password: userPassword,
          sessionToken: sessionStateSnapshot.activeSessionToken,
          csrfToken: sessionStateSnapshot.csrfToken,
        },
      },
    });
    console.log('logged in: ', loggedIn);
    // Update session token in sessionStore + update csrf
    if (loggedIn.data.loginUser) {
      console.log('returned user');
      sessionStateSnapshot.setSession(
        SESSIONS.LOGGEDIN,
        loggedIn.data.loginUser.tokens.token,
      );
      sessionStateSnapshot.setCSRFToken(loggedIn.data.loginUser.tokens.csrf);
      sessionStateSnapshot.setUserId(loggedIn.data.loginUser.user.id);

      setSuccessMessage('Log in succeeded');
      // setTimeout(() => {
      console.log('modalStateSnapshot: ', modalStateSnapshot);
      if (modalStateSnapshot.initialAction === INITIALACTION.SAVETRIP) {
        console.log('initial action save trip');
        // modalStateSnapshot.activateModal(MODALS.NONE);
        modalStateSnapshot.activateModal(MODALS.SAVETRIP);
      } else {
        console.log('not inital action save trip');
        modalStateSnapshot.activateModal(MODALS.NONE);
      }
      // }, 1000);
    } else {
      setError('User name or password wrong');
    }
    // console.log('sessionStoreSnapshot: ', sessionStateSnapshot);
  }

  function handleRegister() {
    modalsStore.activateModal(MODALS.REGISTER);
  }

  function handleClose() {}

  return (
    <Dialog
      open={true}
      onClose={handleClose}
      aria-labelledby="form dialog for login"
    >
      <DialogTitle id="form dialog title for login">Login</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          id="userName"
          label="User name"
          type="text"
          fullWidth
          onChange={(e) => setUserName(e.target.value)}
        />
        <TextField
          margin="dense"
          id="password"
          label="Password"
          type="password"
          fullWidth
          onChange={(e) => setUserPassword(e.target.value)}
        />
        {error ? <Alert severity="error">{error}</Alert> : null}
        {successMessage ? (
          <Alert severity="success">{successMessage}</Alert>
        ) : null}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel} color="primary">
          Cancel
        </Button>
        <Button onClick={handleLogin} color="primary">
          Login
        </Button>
        <Button onClick={handleRegister} color="primary">
          Register
        </Button>
      </DialogActions>
    </Dialog>
  );
}
