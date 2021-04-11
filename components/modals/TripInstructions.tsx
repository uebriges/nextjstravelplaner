import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  List,
  ListItem,
} from '@material-ui/core';
import { useSnapshot } from 'valtio';
import modalsStore, { MODALS } from '../../utils/valtio/modalsstore';
import tripStore from '../../utils/valtio/tripstore';

export default function TripInstructions() {
  const modalStoreSnapshot = useSnapshot(modalsStore);
  const tripStoreSnapshot = useSnapshot(tripStore);

  function handleClose() {
    modalStoreSnapshot.activateModal(MODALS.NONE);
  }

  return (
    <Dialog
      open={true}
      // onClose={handleClose}
      aria-labelledby="form dialog for registration"
    >
      <DialogTitle id="form dialog title for registration">
        Trip instructions
      </DialogTitle>
      <DialogContent>
        <List>
          {tripStoreSnapshot.instructions.map(
            (instructions, indexInstructions, instructionsArray) => {
              const subInstructions = instructions.map(
                (instruction, index, instructionArray) => {
                  if (
                    instructionArray.length === index + 1 &&
                    instructionsArray.length > indexInstructions + 1
                  ) {
                    return <Divider />;
                  }
                  return <ListItem key={instruction}>{instruction}</ListItem>;
                },
              );
              return subInstructions;
            },
          )}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} className="modal-button-label">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
