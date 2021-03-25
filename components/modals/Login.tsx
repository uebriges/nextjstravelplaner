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
import modalsStore, { MODALS } from '../../utils/valtio/modalsstore';

export default function Login(props) {
  const [userName, setUserName] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [error, setError] = useState('');
  // const [];

  // const { loading, error, data } = useQuery(userQuery);

  // if (loading) return 'Loading …';
  // if (error) return 'Something went wrong!';

  function handleCancel() {
    modalsStore.activateModal(MODALS.NONE);
  }

  function handleLogin(event) {
    event.preventDefault();
    if (userName === '' || userPassword === '') {
      setError('User name or password missing.');
    }

    // const response = await fetch('/api/users/login', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     token: props.token,
    //     username,
    //     password,
    //   }),
    // });

    // const result = await response.json();

    // if (response.status === 401) {
    //   setError('Username or password incorrect');
    // } else if (response.status === 500) {
    //   setError('Internal server error.');
    // } else {
    //   cookies.setCookiesClientSide('token', result.token);
    //   dispatchUserState({
    //     type: ACTIONS.LOGIN,
    //     payload: {
    //       username,
    //       isAdmin:
    //         result.isAdmin === null || result.isAdmin === false ? false : true,
    //       userId: result.customerId,
    //     },
    //   });
    //   router.push('/');
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
          autoFocus
          margin="dense"
          id="password"
          label="Password"
          type="text"
          fullWidth
          onChange={(e) => setUserPassword(e.target.value)}
        />
        {error ? <Alert severity="error">{error}</Alert> : null}
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
