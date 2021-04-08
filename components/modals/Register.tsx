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
import modalsStore, { MODALS } from '../../utils/valtio/modalsstore';
import sessionStore from '../../utils/valtio/sessionstore';

export default function Register(props) {
  const [userName, setUserName] = useState('');
  const [userFirstName, setUserFirstName] = useState('');
  const [userLastName, setUserLastName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const modalStoreSnapshot = useSnapshot(modalsStore);
  const sessionStateSnapshot = useSnapshot(sessionStore);

  // GraphQL
  const [registerUser, registeredUser] = useMutation(
    graphqlQueries.registerUser,
    {
      onCompleted({ registerUser }) {
        console.log('Registered user: ', registeredUser);
      },
    },
  );

  const [
    loginUserDB,
    { error: loginError, loading: loginLoading },
  ] = useMutation(graphqlQueries.loginUser, {
    onCompleted({ loggedIn }) {
      return loggedIn;
    },
  });

  function handleCancel() {
    modalsStore.activateModal(MODALS.NONE);
  }

  async function handleRegister() {
    console.log('register');
    const newUser = await registerUser({
      variables: {
        user: {
          username: userName,
          firstName: userFirstName,
          lastName: userLastName,
          email: userEmail,
          password: userPassword,
        },
      },
    });

    console.log('Registration: ', newUser);

    if (newUser.data.registerUser.id === 0) {
      setErrorMessage('User name already exists');
      setSuccessMessage(null);
      return;
    }

    setErrorMessage(null);
    setSuccessMessage('User created');
    setTimeout(() => modalStoreSnapshot.activateModal(MODALS.NONE), 1500);

    // Automatically login after successfull registration
    // const loggedIn = await loginUserDB({
    //   variables: {
    //     user: {
    //       username: userName,
    //       password: userPassword,
    //       sessionToken: sessionStateSnapshot.activeSessionToken,
    //       csrfToken: sessionStateSnapshot.csrfToken,
    //     },
    //   },
    // });
    // console.log('logged in: ', loggedIn);

    // // Update session token in sessionStore + update csrf
    // if (loggedIn.data.loginUser) {
    //   console.log('returned user');
    //   sessionStateSnapshot.setSession(
    //     SESSIONS.LOGGEDIN,
    //     loggedIn.data.loginUser.tokens.token,
    //   );
    //   sessionStateSnapshot.setCSRFToken(loggedIn.data.loginUser.tokens.csrf);
    //   sessionStateSnapshot.setUserId(loggedIn.data.loginUser.user.id);
    //   console.log('modalStateSnapshot: ', modalStoreSnapshot);
    //   modalStoreSnapshot.activateModal(MODALS.NONE);
    // }
  }

  return (
    <Dialog
      open={true}
      // onClose={handleClose}
      aria-labelledby="form dialog for registration"
    >
      <DialogTitle id="form dialog title for registration">
        Register
      </DialogTitle>
      <DialogContent>
        <TextField
          data-cy="RegistrationTextInputUserName"
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
          id="firstName"
          label="First name"
          type="text"
          fullWidth
          onChange={(e) => setUserFirstName(e.target.value)}
          data-cy="RegistrationTextInputUserFirstName"
        />
        <TextField
          margin="dense"
          id="lastName"
          label="Last name"
          type="text"
          fullWidth
          onChange={(e) => setUserLastName(e.target.value)}
          data-cy="RegistrationTextInputUserLastName"
        />
        <TextField
          margin="dense"
          id="email"
          label="E-Mail"
          type="text"
          fullWidth
          onChange={(e) => setUserEmail(e.target.value)}
          data-cy="RegistrationTextInputUserEmail"
        />
        <TextField
          margin="dense"
          id="password"
          label="Password"
          type="password"
          fullWidth
          onChange={(e) => setUserPassword(e.target.value)}
          data-cy="RegistrationTextInputUserPassword"
        />
        {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}
        {successMessage ? (
          <Alert severity="success">{successMessage}</Alert>
        ) : null}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleRegister} color="primary" data-cy="RegisterBtn">
          Register
        </Button>
        <Button onClick={handleCancel} color="primary">
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}
