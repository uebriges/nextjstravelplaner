import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@material-ui/core';
import modalsStore, { MODALS } from '../../utils/valtio/modalsstore';

export default function Login(props) {
  function handleCancel() {
    modalsStore.activateModal(MODALS.NONE);
  }

  function handleLogin() {}

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
        />
        <TextField
          autoFocus
          margin="dense"
          id="password"
          label="Password"
          type="text"
          fullWidth
        />
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
