import React, { ReactNode } from "react";
import { Box, DialogActions, DialogContent, Modal } from "@mui/material";
import Button from "@mui/joy/Button";
import ModalDialog from "@mui/joy/ModalDialog";
import { DialogTitle, ModalClose } from "@mui/joy";
import { ClipLoader } from "react-spinners";

type ConfirmationModalProps = {
  title: string;
  open: boolean;
  handleClose: () => void;
  confirmationAction: (obj?: any) => void;
  isPending: boolean;
};

export function ConfirmationModal(props: ConfirmationModalProps) {
  return (
    <Modal open={props.open} onClose={props.handleClose}>
      <ModalDialog sx={{ maxWidth: "400px" }}>
        <ModalClose onClick={props.handleClose} />
        <DialogTitle sx={{ whiteSpace: "wrap" }}>{props.title}</DialogTitle>
        <DialogActions>
          {props.isPending ? (
            <ClipLoader />
          ) : (
            <Button
              variant="solid"
              color="primary"
              onClick={props.confirmationAction}
            >
              Confirm
            </Button>
          )}
          <Button variant="plain" color="neutral" onClick={props.handleClose}>
            Cancel
          </Button>
        </DialogActions>
      </ModalDialog>
    </Modal>
  );
}
