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
import { loginUser } from '../../utils/graphqlQueries';
import modalsStore, {
  INITIALACTION,
  MODALS,
} from '../../utils/valtio/modalsstore';
import sessionStore, { SESSIONS } from '../../utils/valtio/sessionstore';

export default function Login() {
  const [userName, setUserName] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const sessionStateSnapshot = useSnapshot(sessionStore);
  const modalStateSnapshot = useSnapshot(modalsStore);

  const [loginUserDB] = useMutation(loginUser, {
    onCompleted({ loggedIn }) {
      return loggedIn;
    },
  });

  // if (loading) return 'Loading …';
  // if (error) return 'Something went wrong!';

  function handleCancel() {
    modalsStore.activateModal(MODALS.NONE);
  }

  async function handleLogin(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    if (userName === '' || userPassword === '') {
      setError('User name or password missing.');
      return;
    }
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
    // Update session token in sessionStore + update csrf
    if (loggedIn.data.loginUser) {
      sessionStateSnapshot.setSession(
        SESSIONS.LOGGEDIN,
        loggedIn.data.loginUser.tokens.token,
      );
      sessionStateSnapshot.setCSRFToken(loggedIn.data.loginUser.tokens.csrf);
      sessionStateSnapshot.setUserId(loggedIn.data.loginUser.user.id);

      setSuccessMessage('Log in succeeded');
      // setTimeout(() => {
      if (modalStateSnapshot.initialAction === INITIALACTION.SAVETRIP) {
        // modalStateSnapshot.activateModal(MODALS.NONE);
        modalStateSnapshot.activateModal(MODALS.SAVETRIP);
      } else {
        modalStateSnapshot.activateModal(MODALS.NONE);
      }
      // }, 1000);
    } else {
      setError('User name or password wrong');
    }
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
        <Button onClick={handleLogin} color="primary" data-cy="LoginBtn">
          Login
        </Button>
        <Button
          onClick={handleRegister}
          color="primary"
          data-cy="OpenRegisterBtn"
        >
          Register
        </Button>
      </DialogActions>
    </Dialog>
  );
}
