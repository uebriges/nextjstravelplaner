import { useMutation } from '@apollo/client';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';
import Alert from '@mui/material/Alert';
import { useState } from 'react';
import { useSnapshot } from 'valtio';
import { registerUser } from '../../utils/graphqlQueries';
import modalsStore, { MODALS } from '../../utils/valtio/modalsstore';

export default function Register() {
  const [userName, setUserName] = useState('');
  const [userFirstName, setUserFirstName] = useState('');
  const [userLastName, setUserLastName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>('');
  const [successMessage, setSuccessMessage] = useState<string | null>('');
  const modalStoreSnapshot = useSnapshot(modalsStore);

  // GraphQL
  const [registerUserFunction] = useMutation(registerUser, {
    onCompleted(data) {
      // throw new Error(JSON.stringify(data));
      if (data.registerUser.id === 0) {
        setErrorMessage('User name already exists');
        setSuccessMessage(null);
        return;
      }

      setErrorMessage(null);
      setSuccessMessage('Great... you are registered!');
      setTimeout(() => modalStoreSnapshot.activateModal(MODALS.NONE), 1500);
    },
  });

  function handleCancel() {
    modalsStore.activateModal(MODALS.NONE);
  }

  async function handleRegister() {
    registerUserFunction({
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
  }

  return (
    <Dialog
      open={true}
      aria-labelledby="form dialog for registration"
    >
      <DialogTitle id="form dialog title for registration">
        Register
      </DialogTitle>
      <DialogContent>
        <TextField
          variant="standard"
          data-cy="RegistrationTextInputUserName"
          size="small"
          margin="dense"
          id="userName"
          label="User name"
          type="text"
          fullWidth
          onChange={(e) => setUserName(e.target.value)} />
        <TextField
          variant="standard"
          size="small"
          margin="dense"
          id="firstName"
          label="First name"
          type="text"
          fullWidth
          onChange={(e) => setUserFirstName(e.target.value)}
          data-cy="RegistrationTextInputUserFirstName" />
        <TextField
          variant="standard"
          size="small"
          margin="dense"
          id="lastName"
          label="Last name"
          type="text"
          fullWidth
          onChange={(e) => setUserLastName(e.target.value)}
          data-cy="RegistrationTextInputUserLastName" />
        <TextField
          variant="standard"
          size="small"
          margin="dense"
          id="email"
          label="E-Mail"
          type="text"
          fullWidth
          onChange={(e) => setUserEmail(e.target.value)}
          data-cy="RegistrationTextInputUserEmail" />
        <TextField
          variant="standard"
          size="small"
          margin="dense"
          id="password"
          label="Password"
          type="password"
          fullWidth
          onChange={(e) => setUserPassword(e.target.value)}
          data-cy="RegistrationTextInputUserPassword" />
        {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}
        {successMessage ? (
          <Alert severity="success">{successMessage}</Alert>
        ) : null}
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handleRegister}
          className="modal-button-label"
          data-cy="RegisterBtn"
        >
          Register
        </Button>
        <Button onClick={handleCancel} className="modal-button-label">
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}
