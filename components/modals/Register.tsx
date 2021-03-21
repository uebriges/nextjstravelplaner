import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@material-ui/core';
import modalsStore, { MODALS } from '../../utils/valtio/modalsstore';

export default function Register(props) {
  function handleCancel() {
    modalsStore.activateModal(MODALS.NONE);
  }

  function handleRegister() {}

  function handleClose() {}

  return (
    <Dialog
      open={true}
      onClose={handleClose}
      aria-labelledby="form dialog for registration"
    >
      <DialogTitle id="form dialog title for registration">
        Register
      </DialogTitle>
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
        <Button onClick={handleRegister} color="primary">
          Register
        </Button>
        <Button onClick={handleCancel} color="primary">
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}
